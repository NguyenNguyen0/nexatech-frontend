/**
 * Payment API service — customer-facing.
 * Base: /api/v1/payments
 *
 * ⚠️  payment-service dùng ApiResponse format KHÁC với order-service:
 *       { success: boolean, data: T, message?: string, timestamp: string }
 *     Trường payload là `data`, không phải `result`.
 */

import axiosClient from '@/lib/axios-client';
import type {
  PaymentApiResponse,
  PaymentPageResponse,
  PaymentResponse,
  PaymentStatus,
} from '@/types/payment';
import { PAYMENT_API_BASE } from '@/lib/constants';

export interface MyPaymentsParams {
  status?: PaymentStatus;
  page?: number;
  size?: number;
  sort?: string;
}

/** Lấy thông tin thanh toán theo paymentId. */
export async function getPaymentById(paymentId: string): Promise<PaymentResponse> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentResponse>>(
    `${PAYMENT_API_BASE}/${paymentId}`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không tìm thấy thanh toán');
  return data.data;
}

/** Lấy thông tin thanh toán theo orderId. */
export async function getPaymentByOrder(orderId: string): Promise<PaymentResponse> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentResponse>>(
    `${PAYMENT_API_BASE}/order/${orderId}`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không tìm thấy thanh toán');
  return data.data;
}

/** Lấy lịch sử thanh toán của người dùng hiện tại (phân trang, lọc theo status). */
export async function getMyPayments(
  params?: MyPaymentsParams,
): Promise<PaymentPageResponse<PaymentResponse>> {
  const { data } = await axiosClient.get<PaymentApiResponse<PaymentPageResponse<PaymentResponse>>>(
    `${PAYMENT_API_BASE}/my`,
    { params },
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không lấy được lịch sử thanh toán');
  return data.data;
}
