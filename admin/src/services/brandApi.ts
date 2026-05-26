import axiosClient from '@/lib/axiosClient'
import { buildQueryParams } from '@/lib/queryParams'
import { ensureApiSuccess, unwrapApiEnvelope } from '@/services/apiUtils'
import type { ApiEnvelope } from '@/types/api-envelope'
import type { BrandItem, BrandListParams, BrandUpsertPayload } from '@/types/catalog'

const BRANDS_BASE = '/api/v1/brands'

export async function listBrands(params: BrandListParams = {}): Promise<BrandItem[]> {
  const queryParams = buildQueryParams({
    active: params.active,
    includeDeleted: params.includeDeleted,
    size: params.size,
  })

  const { data } = await axiosClient.get<ApiEnvelope<BrandItem[]>>(BRANDS_BASE, {
    params: queryParams,
  })

  return unwrapApiEnvelope(data, 'Failed to fetch brands')
}

export async function createBrand(payload: BrandUpsertPayload): Promise<BrandItem> {
  const { data } = await axiosClient.post<ApiEnvelope<BrandItem>>(BRANDS_BASE, payload)
  return unwrapApiEnvelope(data, 'Failed to create brand')
}

export async function updateBrand(brandId: string, payload: BrandUpsertPayload): Promise<BrandItem> {
  const { data } = await axiosClient.put<ApiEnvelope<BrandItem>>(`${BRANDS_BASE}/${brandId}`, payload)
  return unwrapApiEnvelope(data, 'Failed to update brand')
}

export async function softDeleteBrand(brandId: string): Promise<void> {
  const { data } = await axiosClient.delete<ApiEnvelope<unknown>>(`${BRANDS_BASE}/${brandId}`)
  ensureApiSuccess(data, 'Failed to delete brand')
}

export async function restoreBrand(brandId: string): Promise<void> {
  const { data } = await axiosClient.patch<ApiEnvelope<unknown>>(`${BRANDS_BASE}/${brandId}/restore`)
  ensureApiSuccess(data, 'Failed to restore brand')
}
