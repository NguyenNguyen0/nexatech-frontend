/**
 * Product API Service — Updated for Backend API Changes (2026-05-11)
 *
 * BREAKING CHANGES:
 * 1. Product fields restructured:
 *    - `categoryId` → `primaryCategoryId` + `categoryIds[]` (product now supports multiple categories)
 *    - `categoryName` → `primaryCategoryName` + `categorySlugs[]`
 *    - `attributes` field removed entirely
 *
 * 2. Category filters now use "contains match" on categoryIds[] instead of exact match on single categoryId
 *    - All category filter endpoints still accept `categoryId` query param
 *    - Backend internally checks if categoryId is in product's categoryIds[] array
 *
 * 3. Related products now filter by `primaryCategoryId` (main category) instead of any category
 *
 * 4. Category model changes:
 *    - `imageUrl` field removed from Category objects
 *    - Use `metadata.bannerImage` for category banner images instead
 *    - `metadata` now contains: seoTitle, seoDescription, bannerImage
 *
 * BACKWARD COMPATIBILITY:
 * - ProductSummary still includes legacy categoryId/categoryName fields for backward compat
 * - Components using these fields will continue to work but should migrate to new primary category fields
 */

import { buildProductQuery, normalizeCollection, normalizePageResult, unwrapProductApiResponse } from '../utils';
import type {
  PageResult,
  ProductBrand,
  ProductCategory,
  ProductDetail,
  ProductListParams,
  ProductReview,
  ProductSubcategory,
  ProductSuggestion,
  ProductSummary,
} from '../types';

const PRODUCT_API_BASE = '/api/v1/products';
const CATEGORY_API_BASE = '/api/v1/categories';
const BRAND_API_BASE = '/api/v1/brands';
const API_GATEWAY_URL = process.env.API_GATEWAY_URL?.replace(/\/$/, '') ?? 'http://localhost:8080';

type SubcategoryTreeNode = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  children?: SubcategoryTreeNode[];
};

function dedupeProducts(products: ProductSummary[]): ProductSummary[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const identity = product.id?.trim() || product.slug?.trim() || `${product.name}:${product.price}`;
    if (!identity || seen.has(identity)) {
      return false;
    }

    seen.add(identity);
    return true;
  });
}

function flattenSubcategoryTree(nodes: SubcategoryTreeNode[]): ProductSubcategory[] {
  const leaves: ProductSubcategory[] = [];

  const visit = (node: SubcategoryTreeNode): void => {
    const children = Array.isArray(node.children) ? node.children : [];

    if (children.length === 0 && node.id && node.name) {
      leaves.push({
        id: node.id,
        name: node.name,
        slug: node.slug,
        description: node.description,
        imageUrl: node.imageUrl,
        children: [],
      });
      return;
    }

    for (const child of children) {
      visit(child);
    }
  };

  for (const node of nodes) {
    visit(node);
  }

  if (leaves.length > 0) {
    return leaves;
  }

  return nodes
    .filter((node): node is Required<Pick<SubcategoryTreeNode, 'id' | 'name'>> & SubcategoryTreeNode => Boolean(node.id && node.name))
    .map((node) => ({
      id: node.id,
      name: node.name,
      slug: node.slug,
      description: node.description,
      imageUrl: node.imageUrl,
      children: Array.isArray(node.children) ? flattenSubcategoryTree(node.children) : [],
    }));
}

function resolveApiPath(path: string): string {
  // Server-side fetch does not reliably support relative URLs for external rewrites.
  if (typeof window === 'undefined' && path.startsWith('/')) {
    return `${API_GATEWAY_URL}${path}`;
  }

  return path;
}

async function requestProductApi<T>(path: string): Promise<T> {
  const response = await fetch(resolveApiPath(path), {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload && typeof (payload as { message?: unknown }).message === 'string'
      ? (payload as { message?: string }).message
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return unwrapProductApiResponse<T>(payload);
}

export async function fetchProducts(params?: ProductListParams): Promise<PageResult<ProductSummary>> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}${buildProductQuery(params)}`);
  return normalizePageResult<ProductSummary>(payload);
}

export async function fetchProductsByCategorySlug(slug: string, params?: ProductListParams): Promise<PageResult<ProductSummary>> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return { items: [], page: params?.page ?? 0, size: params?.size ?? 12, totalItems: 0, totalPages: 1, hasNext: false };
  }

  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/category/slug/${encodeURIComponent(normalizedSlug)}${buildProductQuery(params)}`);
  return normalizePageResult<ProductSummary>(payload);
}

export async function fetchFeaturedProducts(params?: ProductListParams): Promise<PageResult<ProductSummary>> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/featured${buildProductQuery(params)}`);
  return normalizePageResult<ProductSummary>(payload);
}

export async function searchProducts(keyword: string, params?: ProductListParams): Promise<PageResult<ProductSummary>> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/search${buildProductQuery({ ...params, keyword })}`);
  return normalizePageResult<ProductSummary>(payload);
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    throw new Error('Slug san pham khong hop le');
  }

  // New backend contract: dedicated get-by-slug endpoint.
  try {
    return await requestProductApi<ProductDetail>(`${PRODUCT_API_BASE}/slug/${encodeURIComponent(normalizedSlug)}`);
  } catch {
    // Backward-compatible fallback for environments that still expose the legacy direct path.
    return requestProductApi<ProductDetail>(`${PRODUCT_API_BASE}/${encodeURIComponent(normalizedSlug)}`);
  }
}

export async function fetchRelatedProducts(productSlugOrId: string, fallbackProductId?: string): Promise<ProductSummary[]> {
  const normalized = productSlugOrId.trim();
  const candidates = [
    `${PRODUCT_API_BASE}/slug/${encodeURIComponent(normalized)}/related`,
    `${PRODUCT_API_BASE}/${encodeURIComponent(normalized)}/related`,
    fallbackProductId ? `${PRODUCT_API_BASE}/${encodeURIComponent(fallbackProductId)}/related` : undefined,
  ].filter((value): value is string => Boolean(value));

  for (const path of candidates) {
    try {
      const payload = await requestProductApi<unknown>(path);
      // Backend now filters related products by primaryCategoryId instead of single categoryId
      // Products with multi-category support (categoryIds[]) may appear multiple times across category results
      return dedupeProducts(normalizeCollection<ProductSummary>(payload));
    } catch {
      // Try next compatible route.
    }
  }

  return [];
}

export async function fetchProductReviews(productSlugOrId: string, params?: ProductListParams, fallbackProductId?: string): Promise<PageResult<ProductReview>> {
  const normalized = productSlugOrId.trim();
  const query = buildProductQuery(params);
  const candidates = [
    `${PRODUCT_API_BASE}/slug/${encodeURIComponent(normalized)}/reviews${query}`,
    `${PRODUCT_API_BASE}/${encodeURIComponent(normalized)}/reviews${query}`,
    fallbackProductId ? `${PRODUCT_API_BASE}/${encodeURIComponent(fallbackProductId)}/reviews${query}` : undefined,
  ].filter((value): value is string => Boolean(value));

  for (const path of candidates) {
    try {
      const payload = await requestProductApi<unknown>(path);
      return normalizePageResult<ProductReview>(payload);
    } catch {
      // Try next compatible route.
    }
  }

  return { items: [], page: params?.page ?? 1, size: params?.size ?? 10, totalItems: 0, totalPages: 1, hasNext: false };
}

export async function fetchProductSuggestions(keyword: string, params?: { limit?: number; categoryId?: string; brandId?: string }): Promise<ProductSuggestion[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', keyword);
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params?.brandId) searchParams.set('brandId', params.brandId);

  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/suggest?${searchParams.toString()}`);
  return normalizeCollection<ProductSuggestion>(payload);
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  const payload = await requestProductApi<unknown>(CATEGORY_API_BASE);
  return normalizeCollection<ProductCategory>(payload);
}

export async function fetchBrands(): Promise<ProductBrand[]> {
  const payload = await requestProductApi<unknown>(BRAND_API_BASE);
  return normalizeCollection<ProductBrand>(payload);
}

export async function fetchSubcategories(categorySlugOrId: string): Promise<ProductSubcategory[]> {
  const normalized = categorySlugOrId.trim();
  if (!normalized) return [];

  try {
    const payload = await requestProductApi<unknown>(
      `${CATEGORY_API_BASE}/slug/${encodeURIComponent(normalized)}/subcategories`
    );
    const tree = normalizeCollection<SubcategoryTreeNode>(payload);
    return flattenSubcategoryTree(tree);
  } catch {
    // Fallback for current backend implementations that still require category id.
    let categoryId = normalized;

    try {
      const categories = await fetchCategories();
      const matched = categories.find((category) => category.slug === normalized || category.id === normalized);
      if (matched?.id) {
        categoryId = matched.id;
      }
    } catch {
      // Keep original value; next request may still succeed if it's already an id.
    }

    const payload = await requestProductApi<unknown>(
      `${CATEGORY_API_BASE}/${encodeURIComponent(categoryId)}/subcategories`
    );
    const tree = normalizeCollection<SubcategoryTreeNode>(payload);
    return flattenSubcategoryTree(tree);
  }
}
