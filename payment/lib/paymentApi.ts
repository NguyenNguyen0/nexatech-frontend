import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axiosClient';
import { paymentPaths } from '@/lib/paymentPaths';
import { getMockPayments, getMockPaymentById, getMockPaymentByOrderId, getMockPaymentStats } from '@/lib/mockData';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
  Payment,
  PaymentStatsResponse,
  CreatePaymentRequest,
  VNPayPaymentRequest,
  VNPayResponse,
} from '@/types/payment';
import type { PaymentStatus } from '@/types/payment';

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
  try {
    const { data } = await axiosClient.get<ApiResponse<Payment>>(
      paymentPaths.paymentById(id),
    );
    return unwrap(data, 'Không tìm thấy thanh toán');
  } catch {
    const mock = getMockPaymentById(id);
    if (mock) return mock;
    throw new Error('Không tìm thấy thanh toán');
  }
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment> {
  try {
    const { data } = await axiosClient.get<ApiResponse<Payment>>(
      paymentPaths.paymentByOrderId(orderId),
    );
    return unwrap(data, 'Không tìm thấy thanh toán');
  } catch {
    const mock = getMockPaymentByOrderId(orderId);
    if (mock) return mock;
    throw new Error('Không tìm thấy thanh toán');
  }
}

export async function getMyPayments(
  page = 0,
  size = 10,
  status?: PaymentStatus,
): Promise<PageResponse<Payment>> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: 'createdAt,desc',
    });
    if (status) params.set('status', status);
    const { data } = await axiosClient.get<ApiResponse<PageResponse<Payment>>>(
      `${paymentPaths.myPayments}?${params.toString()}`,
    );
    return unwrap(data, 'Không lấy được lịch sử thanh toán');
  } catch {
    return getMockPayments(page, size, status);
  }
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

export async function getAdminPayments(
  page = 0,
  size = 10,
  status?: PaymentStatus,
): Promise<PageResponse<Payment>> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: 'createdAt,desc',
    });
    if (status) params.set('status', status);
    const { data } = await axiosClient.get<ApiResponse<PageResponse<Payment>>>(
      `${paymentPaths.adminPayments}?${params.toString()}`,
    );
    return unwrap(data, 'Không lấy được danh sách thanh toán');
  } catch {
    return getMockPayments(page, size, status);
  }
}

export async function getAdminPaymentById(id: string): Promise<Payment> {
  try {
    const { data } = await axiosClient.get<ApiResponse<Payment>>(
      paymentPaths.adminPaymentById(id),
    );
    return unwrap(data, 'Không tìm thấy thanh toán');
  } catch {
    const mock = getMockPaymentById(id);
    if (mock) return mock;
    throw new Error('Không tìm thấy thanh toán');
  }
}

export async function getPaymentStats(from?: string, to?: string): Promise<PaymentStatsResponse> {
  try {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    const { data } = await axiosClient.get<ApiResponse<PaymentStatsResponse>>(
      `${paymentPaths.adminPaymentStats}${query ? `?${query}` : ''}`,
    );
    return unwrap(data, 'Không lấy được thống kê thanh toán');
  } catch {
    return getMockPaymentStats();
  }
}

export async function adminRefundPayment(id: string): Promise<Payment> {
  const { data } = await axiosClient.post<ApiResponse<Payment>>(
    paymentPaths.adminRefund(id),
  );
  return unwrap(data, 'Hoàn tiền thất bại');
}