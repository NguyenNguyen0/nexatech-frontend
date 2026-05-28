/**
 * Order API service — customer-facing.
 * Base: /api/v1/orders  và  /api/v1/returns
 * ApiResponse format (order-service): { success: boolean, data: T, message?: string, timestamp?: string }
 */

import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axios-client';
import type {
  OrderApiResponse,
  OrderResponse,
  PageResponse,
  CreateReturnRequest,
  ContinuePaymentResponse,
  ReturnResponse,
} from '@/types/order';
import { ORDER_API_BASE, RETURN_API_BASE } from '@/lib/constants';

export interface OrderListParams {
  page?: number;
  size?: number;
  sort?: string;
}

// ── Orders ───────────────────────────────────────────────────────────────────

/** Lấy danh sách đơn hàng của người dùng hiện tại (phân trang). */
export async function getMyOrders(
  params?: OrderListParams,
): Promise<PageResponse<OrderResponse>> {
  const { data } = await axiosClient.get<OrderApiResponse<PageResponse<OrderResponse>>>(
    `${ORDER_API_BASE}/my`,
    { params },
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không lấy được danh sách đơn hàng');
  return data.data;
}

/** Lấy chi tiết một đơn hàng theo ID. */
export async function getOrderById(orderId: string): Promise<OrderResponse> {
  const { data } = await axiosClient.get<OrderApiResponse<OrderResponse>>(
    `${ORDER_API_BASE}/${orderId}`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không tìm thấy đơn hàng');
  return data.data;
}

/** Huỷ đơn hàng (chỉ được khi status = PENDING hoặc CONFIRMED). */
export async function cancelOrder(orderId: string): Promise<OrderResponse> {
  const { data } = await axiosClient.post<OrderApiResponse<OrderResponse>>(
    `${ORDER_API_BASE}/${orderId}/cancel`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Huỷ đơn hàng thất bại');
  return data.data;
}

function readOrderApiError(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }
  const data = error.response?.data as { message?: string; error?: string } | undefined;
  return data?.message || data?.error || fallback;
}

/** Tạo lại link VNPay cho đơn hàng đang PENDING. */
export async function continuePayment(orderId: string): Promise<ContinuePaymentResponse> {
  try {
    const { data } = await axiosClient.post<OrderApiResponse<ContinuePaymentResponse>>(
      `${ORDER_API_BASE}/${orderId}/continue-payment`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Không thể tiếp tục thanh toán');
    }
    return data.data;
  } catch (error) {
    throw new Error(readOrderApiError(error, 'Không thể tiếp tục thanh toán'));
  }
}

/**
 * Kiểm tra người dùng đã từng mua sản phẩm này chưa.
 * Dùng để quyết định có hiển thị form viết đánh giá không.
 */
export async function checkPurchased(
  userId: string,
  productId: string,
): Promise<boolean> {
  const { data } = await axiosClient.get<OrderApiResponse<boolean>>(
    `${ORDER_API_BASE}/check-purchased`,
    { params: { userId, productId } },
  );
  return data.data ?? false;
}

// ── Returns ───────────────────────────────────────────────────────────────────

/** Tạo yêu cầu trả hàng cho một đơn hàng. */
export async function createReturn(
  orderId: string,
  request: CreateReturnRequest,
): Promise<ReturnResponse> {
  const { data } = await axiosClient.post<OrderApiResponse<ReturnResponse>>(
    RETURN_API_BASE,
    request,
    { params: { orderId } },
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Tạo yêu cầu trả hàng thất bại');
  return data.data;
}

/** Lấy danh sách yêu cầu trả hàng của người dùng hiện tại. */
export async function getMyReturns(
  params?: OrderListParams,
): Promise<PageResponse<ReturnResponse>> {
  const { data } = await axiosClient.get<OrderApiResponse<PageResponse<ReturnResponse>>>(
    `${RETURN_API_BASE}/my`,
    { params },
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không lấy được danh sách trả hàng');
  return data.data;
}

/** Lấy chi tiết một yêu cầu trả hàng theo ID. */
export async function getReturnById(returnId: string): Promise<ReturnResponse> {
  const { data } = await axiosClient.get<OrderApiResponse<ReturnResponse>>(
    `${RETURN_API_BASE}/${returnId}`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không tìm thấy yêu cầu trả hàng');
  return data.data;
}
