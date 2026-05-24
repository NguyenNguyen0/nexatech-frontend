import axiosClient from '@/lib/axiosClient'
import { buildQueryParams } from '@/lib/queryParams'
import { ensureApiSuccess, unwrapApiEnvelope } from '@/services/apiUtils'
import type { ApiEnvelope } from '@/types/api-envelope'
import type { CategoryItem, CategoryListParams, CategoryUpsertPayload } from '@/types/catalog'

const CATEGORIES_BASE = '/api/v1/categories'

export async function listCategories(params: CategoryListParams = {}): Promise<CategoryItem[]> {
  const queryParams = buildQueryParams({
    active: params.active,
    includeDeleted: params.includeDeleted,
  })

  const { data } = await axiosClient.get<ApiEnvelope<CategoryItem[]>>(CATEGORIES_BASE, {
    params: queryParams,
  })

  return unwrapApiEnvelope(data, 'Failed to fetch categories')
}

export async function createCategory(payload: CategoryUpsertPayload): Promise<CategoryItem> {
  const { data } = await axiosClient.post<ApiEnvelope<CategoryItem>>(CATEGORIES_BASE, payload)
  return unwrapApiEnvelope(data, 'Failed to create category')
}

export async function updateCategory(categoryId: string, payload: CategoryUpsertPayload): Promise<CategoryItem> {
  const { data } = await axiosClient.put<ApiEnvelope<CategoryItem>>(`${CATEGORIES_BASE}/${categoryId}`, payload)
  return unwrapApiEnvelope(data, 'Failed to update category')
}

export async function softDeleteCategory(categoryId: string): Promise<void> {
  const { data } = await axiosClient.delete<ApiEnvelope<unknown>>(`${CATEGORIES_BASE}/${categoryId}`)
  ensureApiSuccess(data, 'Failed to delete category')
}

export async function restoreCategory(categoryId: string): Promise<void> {
  const { data } = await axiosClient.patch<ApiEnvelope<unknown>>(`${CATEGORIES_BASE}/${categoryId}/restore`)
  ensureApiSuccess(data, 'Failed to restore category')
}
