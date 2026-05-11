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

export async function fetchFeaturedProducts(params?: ProductListParams): Promise<PageResult<ProductSummary>> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/featured${buildProductQuery(params)}`);
  return normalizePageResult<ProductSummary>(payload);
}

export async function searchProducts(keyword: string, params?: ProductListParams): Promise<PageResult<ProductSummary>> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/search${buildProductQuery({ ...params, keyword })}`);
  return normalizePageResult<ProductSummary>(payload);
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail> {
  return requestProductApi<ProductDetail>(`${PRODUCT_API_BASE}/${encodeURIComponent(slug)}`);
}

export async function fetchRelatedProducts(productId: string): Promise<ProductSummary[]> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/${encodeURIComponent(productId)}/related`);
  return normalizeCollection<ProductSummary>(payload);
}

export async function fetchProductReviews(productId: string, params?: ProductListParams): Promise<PageResult<ProductReview>> {
  const payload = await requestProductApi<unknown>(`${PRODUCT_API_BASE}/${encodeURIComponent(productId)}/reviews${buildProductQuery(params)}`);
  return normalizePageResult<ProductReview>(payload);
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

export async function fetchSubcategories(categoryId: string): Promise<ProductSubcategory[]> {
  const payload = await requestProductApi<unknown>(
    `${CATEGORY_API_BASE}/${encodeURIComponent(categoryId)}/subcategories`
  );
  return normalizeCollection<ProductSubcategory>(payload);
}
