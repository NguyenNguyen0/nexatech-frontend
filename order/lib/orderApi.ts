import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axiosClient';
import { orderPaths } from '@/lib/orderPaths';
import type {
  ApiResponse,
  PageResponse,
  Order,
  CheckoutRequest,
  CheckoutResponse,
  CreateReturnRequest,
  ReturnResponse,
} from '@/types/order';

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.'): string {
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

export async function getMyOrders(page = 0, size = 10): Promise<PageResponse<Order>> {
  const { data } = await axiosClient.get<ApiResponse<PageResponse<Order>>>(
    `${orderPaths.myOrders}?page=${page}&size=${size}&sort=createdAt,desc`
  );
  return unwrap(data, 'Không lấy được danh sách đơn hàng');
}

export async function getOrderById(orderId: string): Promise<Order> {
  const { data } = await axiosClient.get<ApiResponse<Order>>(orderPaths.orderById(orderId));
  return unwrap(data, 'Không tìm thấy đơn hàng');
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const { data } = await axiosClient.post<ApiResponse<Order>>(orderPaths.cancelOrder(orderId));
  return unwrap(data, 'Hủy đơn hàng thất bại');
}

export async function checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
  const { data } = await axiosClient.post<ApiResponse<CheckoutResponse>>(orderPaths.checkout, request);
  return unwrap(data, 'Đặt hàng thất bại');
}

export async function createReturn(orderId: string, request: CreateReturnRequest): Promise<ReturnResponse> {
  const { data } = await axiosClient.post<ApiResponse<ReturnResponse>>(
    `${orderPaths.orderById(orderId)}/returns`,
    request
  );
  return unwrap(data, 'Yêu cầu trả hàng thất bại');
}

export async function getMyReturns(page = 0, size = 10): Promise<PageResponse<ReturnResponse>> {
  const { data } = await axiosClient.get<ApiResponse<PageResponse<ReturnResponse>>>(
    `${orderPaths.myReturns}?page=${page}&size=${size}&sort=createdAt,desc`
  );
  return unwrap(data, 'Không lấy được danh sách trả hàng');
}

export async function getReturnById(returnId: string): Promise<ReturnResponse> {
  const { data } = await axiosClient.get<ApiResponse<ReturnResponse>>(orderPaths.returnById(returnId));
  return unwrap(data, 'Không tìm thấy yêu cầu trả hàng');
}
