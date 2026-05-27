import axiosClient from '@/lib/axiosClient'
import { buildQueryParams } from '@/lib/queryParams'
import { ensureApiSuccess, unwrapApiEnvelope } from '@/services/apiUtils'
import type { ApiEnvelope } from '@/types/api-envelope'
import type {
  ProductImageDeletePayload,
  ProductImageReorderPayload,
  ProductItem,
  ProductListParams,
  ProductPageResponse,
  ProductUpsertPayload,
} from '@/types/catalog'

const PRODUCTS_BASE = '/api/v1/products'

export async function listProducts(params: ProductListParams = {}): Promise<ProductPageResponse> {
  const queryParams = buildQueryParams({
    keyword: params.keyword,
    categoryId: params.categoryId,
    categorySlug: params.categorySlug,
    brandId: params.brandId,
    sku: params.sku,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    minRating: params.minRating,
    maxRating: params.maxRating,
    featured: params.featured,
    active: params.active,
    includeDeleted: params.includeDeleted,
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...Object.fromEntries(
      Object.entries(params.specs ?? {}).map(([key, value]) => [`specs.${key}`, value])
    ),
  })

  const { data } = await axiosClient.get<ApiEnvelope<ProductPageResponse>>(PRODUCTS_BASE, {
    params: queryParams,
  })

  return unwrapApiEnvelope(data, 'Failed to fetch products')
}

export async function searchProducts(params: ProductListParams & { keyword: string }): Promise<ProductPageResponse> {
  const queryParams = buildQueryParams({
    keyword: params.keyword,
    categoryId: params.categoryId,
    categorySlug: params.categorySlug,
    brandId: params.brandId,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    minRating: params.minRating,
    maxRating: params.maxRating,
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...Object.fromEntries(
      Object.entries(params.specs ?? {}).map(([key, value]) => [`specs.${key}`, value])
    ),
  })

  const { data } = await axiosClient.get<ApiEnvelope<ProductPageResponse>>(`${PRODUCTS_BASE}/search`, {
    params: queryParams,
  })

  return unwrapApiEnvelope(data, 'Failed to search products')
}

export async function getProductById(productId: string): Promise<ProductItem> {
  const { data } = await axiosClient.get<ApiEnvelope<ProductItem>>(`${PRODUCTS_BASE}/${productId}`)
  return unwrapApiEnvelope(data, 'Failed to fetch product details')
}

export async function createProduct(payload: ProductUpsertPayload): Promise<ProductItem> {
  const { data } = await axiosClient.post<ApiEnvelope<ProductItem>>(PRODUCTS_BASE, payload)
  return unwrapApiEnvelope(data, 'Failed to create product')
}

export async function updateProduct(productId: string, payload: ProductUpsertPayload): Promise<ProductItem> {
  const { data } = await axiosClient.put<ApiEnvelope<ProductItem>>(`${PRODUCTS_BASE}/${productId}`, payload)
  return unwrapApiEnvelope(data, 'Failed to update product')
}

export async function softDeleteProduct(productId: string): Promise<void> {
  const { data } = await axiosClient.delete<ApiEnvelope<unknown>>(`${PRODUCTS_BASE}/${productId}`)
  ensureApiSuccess(data, 'Failed to delete product')
}

export async function restoreProduct(productId: string): Promise<void> {
  const { data } = await axiosClient.patch<ApiEnvelope<unknown>>(`${PRODUCTS_BASE}/${productId}/restore`)
  ensureApiSuccess(data, 'Failed to restore product')
}

export async function uploadProductImages(productId: string, files: File[]): Promise<ProductItem> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  const { data } = await axiosClient.post<ApiEnvelope<ProductItem>>(
    `${PRODUCTS_BASE}/${productId}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return unwrapApiEnvelope(data, 'Failed to upload product images')
}

export async function deleteProductImage(productId: string, payload: ProductImageDeletePayload): Promise<void> {
  const { data } = await axiosClient.delete<ApiEnvelope<unknown>>(`${PRODUCTS_BASE}/${productId}/images`, {
    data: payload,
  })

  ensureApiSuccess(data, 'Failed to delete product image')
}

export async function reorderProductImages(productId: string, payload: ProductImageReorderPayload): Promise<void> {
  const { data } = await axiosClient.put<ApiEnvelope<unknown>>(
    `${PRODUCTS_BASE}/${productId}/images/reorder`,
    payload
  )

  ensureApiSuccess(data, 'Failed to reorder product images')
}
