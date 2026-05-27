import axiosClient from '@/lib/axiosClient'
import type { PageResponse } from '@/types/api-envelope'

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type PaymentMethodType =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'MOMO'
  | 'VNPAY'
  | 'CREDIT_CARD'

interface PaymentApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface PaymentResponse {
  id: string
  orderId: string
  customerId: string
  amount: number
  method: PaymentMethodType
  status: PaymentStatus
  transactionId?: string
  failureReason?: string
  createdAt: string
  completedAt?: string
}

export interface AdminPaymentListParams {
  status?: PaymentStatus
  page?: number
  size?: number
  sort?: string
}

export interface PaymentDailyRevenue {
  date: string
  count: number
  revenue: number
}

export interface PaymentStatsResponse {
  from: string
  to: string
  totalPayments: number
  totalRevenue: number
  byStatus: Record<string, number>
  byMethod: Record<string, number>
  dailyRevenue: PaymentDailyRevenue[]
}

export async function getPaymentById(paymentId: string): Promise<PaymentResponse> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentResponse>>(
    `/api/v1/payments/${paymentId}`,
  )
  if (!data.success || !data.data) throw new Error(data.message ?? 'Payment not found')
  return data.data
}

export async function getPaymentByOrderId(orderId: string): Promise<PaymentResponse> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentResponse>>(
    `/api/v1/payments/order/${orderId}`,
  )
  if (!data.success || !data.data) throw new Error(data.message ?? 'Payment not found')
  return data.data
}

export async function adminGetAllPayments(
  params?: AdminPaymentListParams,
): Promise<PageResponse<PaymentResponse>> {
  const { data } = await axiosClient.get<PaymentApiResponse<PageResponse<PaymentResponse>>>(
    '/api/v1/admin/payments',
    { params },
  )
  if (!data.success || !data.data) throw new Error(data.message ?? 'Unable to load payments')
  return data.data
}

export async function adminGetPaymentStats(from?: string, to?: string): Promise<PaymentStatsResponse> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentStatsResponse>>(
    '/api/v1/admin/payments/stats',
    { params: { from, to } },
  )
  if (!data.success || !data.data) throw new Error(data.message ?? 'Unable to load payment stats')
  return data.data
}

export async function getOptionalPaymentByOrderId(
  orderId: string,
  timeoutMs = 2500,
): Promise<PaymentResponse | null> {
  const res = await axiosClient.get<PaymentApiResponse<PaymentResponse>>(
    `/api/v1/payments/order/${orderId}`,
    {
      timeout: timeoutMs,
      validateStatus: (status) => status < 500,
    },
  )

  if (res.status === 404) return null
  if (res.status >= 400 || !res.data.success || !res.data.data) return null
  return res.data.data
}

export async function adminRefundPayment(paymentId: string): Promise<PaymentResponse> {
  const { data } = await axiosClient.post<PaymentApiResponse<PaymentResponse>>(
    `/api/v1/payments/${paymentId}/refund`,
  )
  if (!data.success || !data.data) throw new Error(data.message ?? 'Refund failed')
  return data.data
}
