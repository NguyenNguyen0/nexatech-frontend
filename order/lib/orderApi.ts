import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axiosClient';
import type { ApiResponse, PageResponse, Order } from '@/types/order';

const ORDERS_BASE = '/api/v1/orders';

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as ApiResponse<unknown> | undefined;
  if (data?.message) return data.message;
  return error.message || fallback;
}

export async function getMyOrders(page = 0, size = 10): Promise<PageResponse<Order>> {
  const { data } = await axiosClient.get<ApiResponse<PageResponse<Order>>>(
    `${ORDERS_BASE}/my?page=${page}&size=${size}&sort=createdAt,desc`
  );
  if (!data.success) throw new Error(data.message || 'Không lấy được danh sách đơn hàng');
  return data.data;
}

export async function getOrderById(orderId: string): Promise<Order> {
  const { data } = await axiosClient.get<ApiResponse<Order>>(`${ORDERS_BASE}/${orderId}`);
  if (!data.success) throw new Error(data.message || 'Không tìm thấy đơn hàng');
  return data.data;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const { data } = await axiosClient.post<ApiResponse<Order>>(`${ORDERS_BASE}/${orderId}/cancel`);
  if (!data.success) throw new Error(data.message || 'Hủy đơn hàng thất bại');
  return data.data;
}
