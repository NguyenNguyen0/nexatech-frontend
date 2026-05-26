/**
 * Admin Order API service.
 * Base: /api/v1/admin/orders  +  /api/v1/returns (admin actions)
 *
 * ApiResponse format (order-service): { code: number, result: T, message?: string }
 */

import axiosClient from '@/lib/axiosClient';

// order-service uses { success, message, data } — different from identity-service { code, result }
interface OrderApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const ORDER_ADMIN_BASE  = '/api/v1/admin/orders';
const RETURN_ADMIN_BASE = '/api/v1/returns';

// ── Enums (mirroring backend) ─────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type OrderPaymentMethod =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'MOMO'
  | 'VNPAY'
  | 'CREDIT_CARD';

export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: OrderPaymentMethod;
  note?: string;
  items: OrderItemResponse[];
  createdAt: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface OrderStatsResponse {
  [key: string]: unknown;
}

export interface ReturnItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  itemReason?: string;
}

export interface ReturnResponse {
  id: string;
  orderId: string;
  customerId: string;
  reason: string;
  status: ReturnStatus;
  adminNote?: string;
  items: ReturnItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateShippingRequest {
  trackingNumber?: string;
  carrierName?: string;
  estimatedDelivery?: string;
}

// ── Admin Order API ───────────────────────────────────────────────────────────

export interface AdminOrderListParams {
  status?: OrderStatus;
  page?: number;
  size?: number;
  sort?: string;
}

/** Lấy tất cả đơn hàng (có thể filter theo status). */
export async function adminGetAllOrders(
  params?: AdminOrderListParams,
): Promise<PageResponse<OrderResponse>> {
  const { data } = await axiosClient.get<OrderApiResponse<PageResponse<OrderResponse>>>(
    ORDER_ADMIN_BASE,
    { params },
  );
  if (!data.data) throw new Error(data.message ?? 'Không lấy được danh sách đơn hàng');
  return data.data;
}

/** Cập nhật trạng thái đơn hàng. */
export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<OrderResponse> {
  const { data } = await axiosClient.patch<OrderApiResponse<OrderResponse>>(
    `${ORDER_ADMIN_BASE}/${orderId}/status`,
    null,
    { params: { status } },
  );
  if (!data.data) throw new Error(data.message ?? 'Cập nhật trạng thái thất bại');
  return data.data!
}

/** Cập nhật thông tin vận chuyển cho đơn hàng. */
export async function adminUpdateOrderShipping(
  orderId: string,
  request: UpdateShippingRequest,
): Promise<OrderResponse> {
  const { data } = await axiosClient.patch<OrderApiResponse<OrderResponse>>(
    `${ORDER_ADMIN_BASE}/${orderId}/shipping`,
    request,
  );
  if (!data.data) throw new Error(data.message ?? 'Cập nhật vận chuyển thất bại');
  return data.data!
}

/** Lấy thống kê đơn hàng theo khoảng ngày (YYYY-MM-DD). */
export async function adminGetOrderStats(
  from: string,
  to: string,
): Promise<OrderStatsResponse> {
  const { data } = await axiosClient.get<OrderApiResponse<OrderStatsResponse>>(
    `${ORDER_ADMIN_BASE}/stats`,
    { params: { from, to } },
  );
  if (!data.data) throw new Error(data.message ?? 'Không lấy được thống kê');
  return data.data ?? {};
}

// ── Admin Return API ──────────────────────────────────────────────────────────

export interface AdminReturnListParams {
  status?: ReturnStatus;
  page?: number;
  size?: number;
}

/** Lấy tất cả yêu cầu trả hàng. */
export async function adminGetAllReturns(
  params?: AdminReturnListParams,
): Promise<PageResponse<ReturnResponse>> {
  const { data } = await axiosClient.get<OrderApiResponse<PageResponse<ReturnResponse>>>(
    `${RETURN_ADMIN_BASE}`,
    { params },
  );
  if (!data.data) throw new Error(data.message ?? 'Không lấy được danh sách trả hàng');
  return data.data!
}

/** Duyệt yêu cầu trả hàng. */
export async function adminApproveReturn(returnId: string): Promise<ReturnResponse> {
  const { data } = await axiosClient.patch<OrderApiResponse<ReturnResponse>>(
    `${RETURN_ADMIN_BASE}/${returnId}/approve`,
  );
  if (!data.data) throw new Error(data.message ?? 'Duyệt trả hàng thất bại');
  return data.data!
}

/** Từ chối yêu cầu trả hàng. */
export async function adminRejectReturn(returnId: string, note?: string): Promise<ReturnResponse> {
  const { data } = await axiosClient.patch<OrderApiResponse<ReturnResponse>>(
    `${RETURN_ADMIN_BASE}/${returnId}/reject`,
    null,
    { params: { note: note ?? '' } },
  );
  if (!data.data) throw new Error(data.message ?? 'Từ chối trả hàng thất bại');
  return data.data!
}
