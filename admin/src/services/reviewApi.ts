import axiosClient from '@/lib/axiosClient'
import { unwrapApiEnvelope } from '@/services/apiUtils'
import type { ApiEnvelope, PageResponse } from '@/types/api-envelope'

const REVIEWS_BASE = '/api/v1/reviews'

export interface ReviewItem {
  id: string
  productId: string
  productName?: string
  productSlug?: string
  productThumbnail?: string
  userId: string
  rating: number
  title?: string
  content?: string
  images?: string[]
  helpfulCount: number
  createdAt: string
}

export interface ReviewListParams {
  productId?: string
  rating?: number
  userId?: string
  from?: string
  to?: string
  page?: number
  size?: number
  sort?: string | string[]
}

export async function listReviews(params: ReviewListParams = {}): Promise<PageResponse<ReviewItem>> {
  const { data } = await axiosClient.get<ApiEnvelope<PageResponse<ReviewItem>>>(REVIEWS_BASE, { params })
  return unwrapApiEnvelope(data, 'Failed to fetch customer reviews')
}

export async function markReviewHelpful(reviewId: string): Promise<ReviewItem> {
  const { data } = await axiosClient.post<ApiEnvelope<ReviewItem>>(`${REVIEWS_BASE}/${reviewId}/helpful`)
  return unwrapApiEnvelope(data, 'Failed to update review helpful count')
}
