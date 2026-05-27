import axiosClient from '@/lib/axiosClient'
import { unwrapApiEnvelope } from '@/services/apiUtils'
import type { ApiEnvelope, PageResponse } from '@/types/api-envelope'

export interface NotificationItem {
  id: string
  type: string
  channel: string
  subject?: string
  content?: string
  status: string
  failureReason?: string
  retryCount: number
  lastRetryAt?: string
  createdAt: string
}

export async function listFailedNotifications(page = 0, size = 10): Promise<PageResponse<NotificationItem>> {
  const { data } = await axiosClient.get<ApiEnvelope<PageResponse<NotificationItem>>>(
    '/api/v1/admin/notifications/failed',
    { params: { page, size, sort: 'createdAt,desc' } },
  )

  return unwrapApiEnvelope(data, 'Failed to fetch failed notifications')
}
