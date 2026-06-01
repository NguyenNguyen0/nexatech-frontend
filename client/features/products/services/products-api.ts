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
 * - ProductMinimal is used for collection/search responses.
 * - ProductDetail keeps rich fields for product detail pages.
 */

import { featureFlags, getMockApiIndicator } from '@/lib/feature-flags';
import { resolveBackendBaseUrl } from '@/lib/server-env';
import { buildProductQuery, normalizeCollection, normalizePageResult, unwrapProductApiResponse } from '../utils';
import type {
  PageResult,
  ProductBrand,
  ProductCategory,
  ProductDetail,
  ProductListParams,
  ProductMinimal,
  ProductReview,
  ProductSubcategory,
  ProductSuggestion,
  RecommendationItem,
  RecommendationProductPayload,
  RecommendationResponse,
} from '../types';

const PRODUCT_API_BASE = '/api/v1/products';
const CATEGORY_API_BASE = '/api/v1/categories';
const BRAND_API_BASE = '/api/v1/brands';
const RECOMMEND_API_BASE = '/api/v1/recommend';
const API_GATEWAY_URL = resolveBackendBaseUrl();
const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
const RECOMMEND_REQUEST_TIMEOUT_MS = 5000;
const PRODUCT_CACHE_REVALIDATE_SECONDS = 60 * 60;

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

type RecommendationApiPayload = Partial<RecommendationResponse> & {
  similar?: RecommendationItem[];
  popular?: RecommendationItem[];
  user?: RecommendationItem[];
};

type SubcategoryTreeNode = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  children?: SubcategoryTreeNode[];
};

function dedupeProducts(products: ProductMinimal[]): ProductMinimal[] {
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
  // Feature flag: USE_MOCK_API controls which API source to use
  // - true: Use local mock API routes (/api/v1/...)
  // - false (default): Use real API Gateway

  if (featureFlags.USE_MOCK_API) {
    // Use mock API via the Next.js app origin on the server, and relative paths in the browser.
    if (typeof window === 'undefined' && path.startsWith('/')) {
      return `${FRONTEND_BASE_URL}${path}`;
    }
    return path;
  }

  // Default behavior: Always use real API Gateway
  // Both client-side and server-side requests go to the actual backend
  if (path.startsWith('/')) {
    return `${API_GATEWAY_URL}${path}`;
  }

  return path;
}

function isServerRuntime(): boolean {
  return typeof window === 'undefined';
}

export async function fetchCatalogCacheVersion(): Promise<string | null> {
  if (featureFlags.USE_MOCK_API) {
    return 'mock-catalog';
  }

  const response = await fetch(resolveApiPath(`${PRODUCT_API_BASE}/catalog-version`), {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  const unwrapped = unwrapProductApiResponse<unknown>(payload);

  if (unwrapped && typeof unwrapped === 'object' && 'version' in unwrapped) {
    const version = (unwrapped as { version?: unknown }).version;
    return typeof version === 'string' && version.trim() ? version : null;
  }

  return null;
}

async function requestProductApi<T>(path: string): Promise<T> {
  const resolvedPath = resolveApiPath(path);
  const catalogVersion = isServerRuntime()
    ? await fetchCatalogCacheVersion().catch(() => null)
    : null;
  const useServerCache = isServerRuntime() && Boolean(catalogVersion);
  
  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.debug(`${getMockApiIndicator()} [Products API] GET ${resolvedPath}`, {
      cache: useServerCache ? 'force-cache' : 'no-store',
      catalogVersion,
    });
  }

  const fetchInit: NextFetchInit = {
    method: 'GET',
    cache: useServerCache ? 'force-cache' : 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(catalogVersion ? { 'x-nexatech-catalog-version': catalogVersion } : {}),
    },
    ...(useServerCache
      ? {
          next: {
            revalidate: PRODUCT_CACHE_REVALIDATE_SECONDS,
            tags: ['product-catalog', `product-catalog:${catalogVersion}`],
          },
        }
      : {}),
  };

  const response = await fetch(resolvedPath, fetchInit);

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload && typeof (payload as { message?: unknown }).message === 'string'
      ? (payload as { message?: string }).message
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return unwrapProductApiResponse<T>(payload);
}

function resolveGatewayPath(path: string): string {
  if (path.startsWith('/')) {
    return `${API_GATEWAY_URL}${path}`;
  }

  return path;
}

async function requestGatewayApi<T>(path: string): Promise<T> {
  const resolvedPath = resolveGatewayPath(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RECOMMEND_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(resolvedPath, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
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

    // Recommendation endpoints may return either wrapped payloads
    // (success/data or code/result) or raw JSON objects.
    try {
      return unwrapProductApiResponse<T>(payload);
    } catch {
      if (payload && typeof payload === 'object') {
        return payload as T;
      }
      throw new Error('Recommendation response is invalid');
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Recommendation request timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeRecommendedProducts(payload: RecommendationResponse): ProductMinimal[] {
  const recommendations = extractRecommendationItems(payload);
  const mapped: ProductMinimal[] = [];

  for (const item of recommendations) {
    if (!item || typeof item !== 'object') continue;
    const product = item.product;
    if (!product || typeof product !== 'object') continue;

    const id = typeof product.id === 'string' && product.id.trim() ? product.id : '';
    const slug = typeof product.slug === 'string' && product.slug.trim() ? product.slug : '';
    const name = typeof product.name === 'string' && product.name.trim() ? product.name : '';
    const price = typeof product.price === 'number' ? product.price : Number(product.price ?? NaN);

    if (!id || !slug || !name || !Number.isFinite(price)) continue;

    mapped.push({
      id,
      slug,
      name,
      price,
      thumbnail: typeof product.thumbnail === 'string' ? product.thumbnail : undefined,
      brandName: typeof product.brandName === 'string' ? product.brandName : undefined,
      primaryCategoryName: typeof product.primaryCategoryName === 'string' ? product.primaryCategoryName : undefined,
      averageRating: typeof product.averageRating === 'number' ? product.averageRating : undefined,
      reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : undefined,
    });
  }

  return dedupeProducts(mapped);
}

function extractRecommendationItems(payload: unknown): RecommendationItem[] {
  if (!payload || typeof payload !== 'object') return [];

  const data = payload as RecommendationApiPayload;
  if (Array.isArray(data.recommendations)) return data.recommendations;
  if (Array.isArray(data.similar)) return data.similar;
  if (Array.isArray(data.popular)) return data.popular;
  if (Array.isArray(data.user)) return data.user;
  return [];
}

function toRecommendationProductPayload(product: ProductMinimal): RecommendationProductPayload | null {
  const id = typeof product.id === 'string' && product.id.trim() ? product.id : '';
  const slug = typeof product.slug === 'string' && product.slug.trim() ? product.slug : '';
  const name = typeof product.name === 'string' && product.name.trim() ? product.name : '';
  const price = typeof product.price === 'number' ? product.price : Number(product.price ?? NaN);

  if (!id || !slug || !name || !Number.isFinite(price)) {
    return null;
  }

  return {
    id,
    slug,
    name,
    price,
    thumbnail: product.thumbnail,
    brandName: product.brandName,
    primaryCategoryName: product.primaryCategoryName,
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
  };
}

async function hydrateRecommendationItems(items: RecommendationItem[]): Promise<RecommendationItem[]> {
  const missingProductIds = Array.from(
    new Set(
      items
        .filter((item) => {
          if (!item || typeof item !== 'object') return false;
          const hasProduct = Boolean(item.product && typeof item.product === 'object');
          return !hasProduct && typeof item.productId === 'string' && item.productId.trim().length > 0;
        })
        .map((item) => item.productId.trim()),
    ),
  );

  if (missingProductIds.length === 0) {
    return items;
  }

  const hydratedEntries = await Promise.all(
    missingProductIds.map(async (productId) => {
      try {
        const product = await requestProductApi<ProductMinimal>(`${PRODUCT_API_BASE}/${encodeURIComponent(productId)}`);
        const mapped = toRecommendationProductPayload(product);
        return mapped ? ([productId, mapped] as const) : null;
      } catch {
        return null;
      }
    }),
  );

  const hydratedMap = new Map<string, RecommendationProductPayload>();
  for (const entry of hydratedEntries) {
    if (!entry) continue;
    hydratedMap.set(entry[0], entry[1]);
  }

  return items.map((item) => {
    if (!item || typeof item !== 'object') return item;
    if (item.product && typeof item.product === 'object') return item;

    const fallbackProduct = hydratedMap.get(item.productId);
    if (!fallbackProduct) return item;

    return {
      ...item,
      product: fallbackProduct,
    };
  });
}

async function fetchRecommendedProducts(path: string): Promise<ProductMinimal[]> {
  const payload = await requestGatewayApi<unknown>(path);
  const items = extractRecommendationItems(payload);
  if (items.length === 0) return [];

  const hydratedItems = await hydrateRecommendationItems(items);
  return normalizeRecommendedProducts({ recommendations: hydratedItems });
}

export async function fetchProducts(params?: ProductListParams): Promise<PageResult<ProductMinimal>> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}${buildProductQuery(params)}`);
  return normalizePageResult<ProductMinimal>(payload);
}

export async function fetchProductsByTags(
  tags: string[] = ['hot', 'new'],
  params?: ProductListParams,
): Promise<PageResult<ProductMinimal>> {
  const payload = await requestProductApi<unknown>(
    `${PRODUCT_API_BASE}/tags${buildProductQuery({
      ...params,
      page: params?.page ?? 0,
      size: params?.size ?? 8,
      sort: params?.sort ?? 'createdAt,desc',
      tags,
    })}`,
  );

  return normalizePageResult<ProductMinimal>(payload);
}

export async function fetchProductsByCategorySlug(slug: string, params?: ProductListParams): Promise<PageResult<ProductMinimal>> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return { items: [], page: params?.page ?? 0, size: params?.size ?? 12, totalItems: 0, totalPages: 1, hasNext: false };
  }

  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/category/slug/${encodeURIComponent(normalizedSlug)}${buildProductQuery(params)}`);
  return normalizePageResult<ProductMinimal>(payload);
}

export async function fetchRandomProductsByCategorySlug(slug: string, limit = 8): Promise<ProductMinimal[]> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return [];

  const safeLimit = Math.max(1, Math.min(limit, 12));
  const payload = await requestProductApi<unknown>(
    `${PRODUCT_API_BASE}/category/slug/${encodeURIComponent(normalizedSlug)}/random?limit=${encodeURIComponent(String(safeLimit))}`,
  );

  return dedupeProducts(normalizeCollection<ProductMinimal>(payload)).slice(0, safeLimit);
}

export async function fetchFeaturedProducts(params?: ProductListParams): Promise<PageResult<ProductMinimal>> {
  return fetchProductsByTags(['hot', 'new'], params);
}

export async function searchProducts(keyword: string, params?: ProductListParams): Promise<PageResult<ProductMinimal>> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/search${buildProductQuery({ ...params, keyword })}`);
  return normalizePageResult<ProductMinimal>(payload);
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

export async function fetchProductById(id: string): Promise<ProductDetail> {
  const normalizedId = id.trim();
  if (!normalizedId) {
    throw new Error('ID san pham khong hop le');
  }

  return requestProductApi<ProductDetail>(`${PRODUCT_API_BASE}/${encodeURIComponent(normalizedId)}`);
}

export async function fetchRelatedProducts(productSlugOrId: string, fallbackProductId?: string): Promise<ProductMinimal[]> {
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
      return dedupeProducts(normalizeCollection<ProductMinimal>(payload));
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

  return { items: [], page: params?.page ?? 0, size: params?.size ?? 10, totalItems: 0, totalPages: 0, hasNext: false };
}

export interface ProductSuggestionsResult {
  suggestions: ProductSuggestion[];
  totalItems: number;
}

export async function fetchProductSuggestions(keyword: string, params?: { limit?: number; categoryId?: string; brandId?: string }): Promise<ProductSuggestionsResult> {
  const normalized = keyword.trim();
  if (normalized.length < 2) return { suggestions: [], totalItems: 0 };

  const limit = Math.max(1, Math.min(params?.limit ?? 6, 20));
  const result = await searchProducts(normalized, {
    page: 0,
    size: limit,
    sort: 'createdAt,desc',
    categoryId: params?.categoryId,
    brandId: params?.brandId,
  });

  return {
    suggestions: result.items.slice(0, limit).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      thumbnail: product.thumbnail,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      categoryIds: product.categoryIds,
      brandId: product.brandId,
    })),
    totalItems: result.totalItems ?? result.items.length,
  };
}

export async function fetchPopularRecommendations(topK = 8): Promise<ProductMinimal[]> {
  if (!featureFlags.ENABLE_RECOMMENDATION) return [];

  return fetchRecommendedProducts(
    `${RECOMMEND_API_BASE}/popular?top_k=${encodeURIComponent(String(topK))}&enrich=true`,
  );
}

export async function fetchUserRecommendations(userId: string, topK = 8): Promise<ProductMinimal[]> {
  if (!featureFlags.ENABLE_RECOMMENDATION) return [];

  const normalizedUserId = userId.trim();
  if (!normalizedUserId) return [];

  return fetchRecommendedProducts(
    `${RECOMMEND_API_BASE}/user/${encodeURIComponent(normalizedUserId)}?top_k=${encodeURIComponent(String(topK))}&enrich=true`,
  );
}

export async function fetchSimilarRecommendations(productId: string, topK = 8): Promise<ProductMinimal[]> {
  if (!featureFlags.ENABLE_RECOMMENDATION) return [];

  const normalizedProductId = productId.trim();
  if (!normalizedProductId) return [];

  return fetchRecommendedProducts(
    `${RECOMMEND_API_BASE}/similar/${encodeURIComponent(normalizedProductId)}?top_k=${encodeURIComponent(String(topK))}&enrich=true`,
  );
}

export async function fetchRecommendedProductsForPdp(productId: string, topK = 8): Promise<ProductMinimal[]> {
  if (!featureFlags.ENABLE_RECOMMENDATION) return [];

  const similar = await fetchSimilarRecommendations(productId, topK).catch((error) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Recommend] PDP similar failed', { productId, topK, error });
    }
    return [];
  });
  if (similar.length > 0) {
    return similar;
  }

  return fetchPopularRecommendations(topK).catch((error) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Recommend] PDP popular fallback failed', { productId, topK, error });
    }
    return [];
  });
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  const payload = await requestProductApi<unknown>(CATEGORY_API_BASE);
  return normalizeCollection<ProductCategory>(payload);
}

export async function fetchCategoryMenu(): Promise<ProductCategory[]> {
  const payload = await requestProductApi<unknown>(`${CATEGORY_API_BASE}/menu`);
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
