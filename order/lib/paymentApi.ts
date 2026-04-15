import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axiosClient';
import type { ApiResponse, PageResponse } from '@/types/order';
import type { Payment } from '@/types/payment';

const PAYMENTS_BASE = '/api/v1/payments';

export function getPaymentErrorMessage(
  error: unknown,
  fallback = 'Có lỗi xảy ra. Vui lòng thử lại.',
): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as ApiResponse<unknown> | undefined;
  if (data?.message) return data.message;
  return error.message || fallback;
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment> {
  const { data } = await axiosClient.get<ApiResponse<Payment>>(
    `${PAYMENTS_BASE}/order/${orderId}`,
  );
  if (!data.success) throw new Error(data.message || 'Không tìm thấy thanh toán');
  return data.data;
}

export async function getMyPayments(
  page = 0,
  size = 10,
): Promise<PageResponse<Payment>> {
  const { data } = await axiosClient.get<ApiResponse<PageResponse<Payment>>>(
    `${PAYMENTS_BASE}/my?page=${page}&size=${size}&sort=createdAt,desc`,
  );
  if (!data.success)
    throw new Error(data.message || 'Không lấy được lịch sử thanh toán');
  return data.data;
}
