/**
 * Admin Payment API service.
 * Base: /api/v1/admin/payments
 *
 * ⚠️  payment-service dùng ApiResponse format KHÁC:
 *       { success: boolean, data: T, message?: string, timestamp: string }
 */

import axiosClient from '@/lib/axiosClient';

const PAYMENT_ADMIN_BASE = '/api/v1/admin/payments';

// ── Enums ─────────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type PaymentMethodType =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'MOMO'
  | 'VNPAY'
  | 'CREDIT_CARD';

// ── Response types ────────────────────────────────────────────────────────────

/** Wrapper response từ payment-service. */
interface PaymentApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethodType;
  status: PaymentStatus;
  transactionId?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentPageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PaymentStatsResponse {
  [key: string]: unknown;
}

// ── Admin Payment API ─────────────────────────────────────────────────────────

export interface AdminPaymentListParams {
  status?: PaymentStatus;
  page?: number;
  size?: number;
  sort?: string;
}

/** Lấy tất cả giao dịch thanh toán (có thể filter theo status). */
export async function adminGetAllPayments(
  params?: AdminPaymentListParams,
): Promise<PaymentPageResponse<PaymentResponse>> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentPageResponse<PaymentResponse>>>(
    PAYMENT_ADMIN_BASE,
    { params },
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không lấy được danh sách thanh toán');
  return data.data;
}

/** Lấy chi tiết một giao dịch theo ID. */
export async function adminGetPaymentById(paymentId: string): Promise<PaymentResponse> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentResponse>>(
    `${PAYMENT_ADMIN_BASE}/${paymentId}`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không tìm thấy giao dịch');
  return data.data;
}

/** Lấy thống kê thanh toán theo khoảng ngày (YYYY-MM-DD). */
export async function adminGetPaymentStats(
  from: string,
  to: string,
): Promise<PaymentStatsResponse> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentStatsResponse>>(
    `${PAYMENT_ADMIN_BASE}/stats`,
    { params: { from, to } },
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không lấy được thống kê');
  return data.data;
}

/** Hoàn tiền cho giao dịch. */
export async function adminRefundPayment(paymentId: string): Promise<PaymentResponse> {
  const { data } = await axiosClient.post<PaymentApiResponse<PaymentResponse>>(
    `${PAYMENT_ADMIN_BASE}/${paymentId}/refund`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Hoàn tiền thất bại');
  return data.data;
}
