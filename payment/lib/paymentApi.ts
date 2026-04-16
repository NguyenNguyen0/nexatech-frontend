import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axiosClient';
import { paymentPaths } from '@/lib/paymentPaths';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Payment, CreatePaymentRequest, VNPayPaymentRequest, VNPayResponse } from '@/types/payment';

export function getPaymentErrorMessage(
  error: unknown,
  fallback = 'Có lỗi xảy ra. Vui lòng thử lại.',
): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as ApiResponse<unknown> | undefined;
  if (data?.message) return data.message;
  return error.message || fallback;
}

function unwrap<T>(res: ApiResponse<T>, errorMsg: string): T {
  if (!res.success || res.data === undefined) {
    throw new Error(res.message || errorMsg);
  }
  return res.data;
}

export async function getPaymentById(id: string): Promise<Payment> {
  const { data } = await axiosClient.get<ApiResponse<Payment>>(
    paymentPaths.paymentById(id),
  );
  return unwrap(data, 'Không tìm thấy thanh toán');
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment> {
  const { data } = await axiosClient.get<ApiResponse<Payment>>(
    paymentPaths.paymentByOrderId(orderId),
  );
  return unwrap(data, 'Không tìm thấy thanh toán');
}

export async function getMyPayments(
  page = 0,
  size = 10,
): Promise<PageResponse<Payment>> {
  const { data } = await axiosClient.get<ApiResponse<PageResponse<Payment>>>(
    `${paymentPaths.myPayments}?page=${page}&size=${size}&sort=createdAt,desc`,
  );
  return unwrap(data, 'Không lấy được lịch sử thanh toán');
}

export async function createPayment(request: CreatePaymentRequest): Promise<Payment> {
  const { data } = await axiosClient.post<ApiResponse<Payment>>(
    paymentPaths.payments,
    request,
  );
  return unwrap(data, 'Tạo thanh toán thất bại');
}

export async function createVNPayPayment(request: VNPayPaymentRequest): Promise<VNPayResponse> {
  const { data } = await axiosClient.post<ApiResponse<VNPayResponse>>(
    paymentPaths.createVNPay,
    request,
  );
  return unwrap(data, 'Tạo thanh toán VNPay thất bại');
}
