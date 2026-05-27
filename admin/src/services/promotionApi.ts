import axios from 'axios'
import axiosClient from '@/lib/axiosClient'
import { unwrapApiEnvelope } from '@/services/apiUtils'
import type { ApiEnvelope } from '@/types/api-envelope'

const ADMIN_FLASH_SALE_BASE = '/api/v1/admin/flash-sales'
const PROMOTION_DIRECT_BASE = String(import.meta.env.VITE_PROMOTION_BASE_URL || 'http://localhost:8093').replace(/\/$/, '')

export type FlashSaleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'CANCELLED'

export interface AdminFlashSaleItem {
  id: string
  promotionId: string
  code: string
  codePrefix: string
  name: string
  description?: string
  status: FlashSaleStatus
  discountPercent: number
  productId: string
  productName?: string
  productSlug?: string
  productThumbnail?: string
  originalPrice: number
  salePrice: number
  totalStock: number
  remainingStock: number
  soldCount: number
  soldPercent: number
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

export interface AdminFlashSaleListResponse {
  items: AdminFlashSaleItem[]
  total: number
}

export interface BulkFlashSaleProductPayload {
  productId: string
  productName: string
  productSlug?: string
  productThumbnail?: string
  originalPrice: number
  discountPercent?: number
  salePrice?: number
  totalStock: number
}

export interface CreateBulkFlashSalePayload {
  name: string
  codePrefix: string
  description?: string
  defaultDiscountPercent: number
  startTime: string
  endTime: string
  status: 'DRAFT' | 'ACTIVE'
  products: BulkFlashSaleProductPayload[]
}

export interface DeleteFlashSaleCampaignPayload {
  codePrefix: string
  name: string
  startTime: string
  endTime: string
  status: FlashSaleStatus
}

export interface DeleteFlashSaleCampaignResponse {
  deleted: number
}

export interface UpdateFlashSaleCampaignStatusPayload {
  codePrefix: string
  name: string
  startTime: string
  endTime: string
  currentStatus: FlashSaleStatus
  status: Exclude<FlashSaleStatus, 'ENDED'>
}

export interface UpdateFlashSaleCampaignStatusResponse {
  updated: number
}

export async function listAdminFlashSales(status?: FlashSaleStatus): Promise<AdminFlashSaleListResponse> {
  const config = {
    params: status ? { status } : undefined,
  }

  try {
    const { data } = await axiosClient.get<ApiEnvelope<AdminFlashSaleListResponse>>(ADMIN_FLASH_SALE_BASE, config)
    return unwrapApiEnvelope(data, 'Failed to fetch flash sales')
  } catch (error) {
    if (!shouldUsePromotionFallback(error)) throw error

    const { data } = await axios.get<ApiEnvelope<AdminFlashSaleListResponse>>(
      `${PROMOTION_DIRECT_BASE}${ADMIN_FLASH_SALE_BASE}`,
      config
    )
    return unwrapApiEnvelope(data, 'Failed to fetch flash sales')
  }
}

export async function createBulkFlashSale(
  payload: CreateBulkFlashSalePayload
): Promise<AdminFlashSaleListResponse> {
  try {
    const { data } = await axiosClient.post<ApiEnvelope<AdminFlashSaleListResponse>>(
      `${ADMIN_FLASH_SALE_BASE}/bulk`,
      payload
    )
    return unwrapApiEnvelope(data, 'Failed to create flash sale')
  } catch (error) {
    if (!shouldUsePromotionFallback(error)) throw error

    const { data } = await axios.post<ApiEnvelope<AdminFlashSaleListResponse>>(
      `${PROMOTION_DIRECT_BASE}${ADMIN_FLASH_SALE_BASE}/bulk`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return unwrapApiEnvelope(data, 'Failed to create flash sale')
  }
}

export async function deleteFlashSaleCampaign(
  payload: DeleteFlashSaleCampaignPayload
): Promise<DeleteFlashSaleCampaignResponse> {
  const config = {
    params: payload,
  }

  try {
    const { data } = await axiosClient.delete<ApiEnvelope<DeleteFlashSaleCampaignResponse>>(
      `${ADMIN_FLASH_SALE_BASE}/campaign`,
      config
    )
    return unwrapApiEnvelope(data, 'Failed to delete flash sale')
  } catch (error) {
    if (!shouldUsePromotionFallback(error)) throw error

    const { data } = await axios.delete<ApiEnvelope<DeleteFlashSaleCampaignResponse>>(
      `${PROMOTION_DIRECT_BASE}${ADMIN_FLASH_SALE_BASE}/campaign`,
      config
    )
    return unwrapApiEnvelope(data, 'Failed to delete flash sale')
  }
}

function shouldUsePromotionFallback(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404 && PROMOTION_DIRECT_BASE.length > 0
}

export async function updateFlashSaleCampaignStatus(
  payload: UpdateFlashSaleCampaignStatusPayload
): Promise<UpdateFlashSaleCampaignStatusResponse> {
  const { status, ...params } = payload
  const config = {
    params,
  }

  try {
    const { data } = await axiosClient.patch<ApiEnvelope<UpdateFlashSaleCampaignStatusResponse>>(
      `${ADMIN_FLASH_SALE_BASE}/campaign/status`,
      { status },
      config
    )
    return unwrapApiEnvelope(data, 'Failed to update flash sale status')
  } catch (error) {
    if (!shouldUsePromotionFallback(error)) throw error

    const { data } = await axios.patch<ApiEnvelope<UpdateFlashSaleCampaignStatusResponse>>(
      `${PROMOTION_DIRECT_BASE}${ADMIN_FLASH_SALE_BASE}/campaign/status`,
      { status },
      {
        ...config,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return unwrapApiEnvelope(data, 'Failed to update flash sale status')
  }
}
