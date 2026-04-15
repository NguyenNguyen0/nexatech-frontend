import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axiosClient';
import type { ApiResponse, Cart, AddToCartRequest, UpdateCartItemRequest, CheckoutRequest, CheckoutResponse } from '@/types/cart';

const CART_BASE = '/api/v1/cart';
const CHECKOUT_URL = '/api/v1/checkout';

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as ApiResponse<unknown> | undefined;
  if (data?.message) return data.message;
  return error.message || fallback;
}

export async function getCart(): Promise<Cart> {
  const { data } = await axiosClient.get<ApiResponse<Cart>>(CART_BASE);
  if (!data.success) throw new Error(data.message || 'Không lấy được giỏ hàng');
  return data.data;
}

export async function addToCart(body: AddToCartRequest): Promise<Cart> {
  const { data } = await axiosClient.post<ApiResponse<Cart>>(`${CART_BASE}/items`, body);
  if (!data.success) throw new Error(data.message || 'Thêm sản phẩm thất bại');
  return data.data;
}

export async function updateCartItem(productId: string, body: UpdateCartItemRequest): Promise<Cart> {
  const { data } = await axiosClient.put<ApiResponse<Cart>>(`${CART_BASE}/items/${productId}`, body);
  if (!data.success) throw new Error(data.message || 'Cập nhật thất bại');
  return data.data;
}

export async function removeCartItem(productId: string): Promise<Cart> {
  const { data } = await axiosClient.delete<ApiResponse<Cart>>(`${CART_BASE}/items/${productId}`);
  if (!data.success) throw new Error(data.message || 'Xóa sản phẩm thất bại');
  return data.data;
}

export async function clearCart(): Promise<void> {
  await axiosClient.delete(CART_BASE);
}

export async function checkout(body: CheckoutRequest): Promise<CheckoutResponse> {
  const { data } = await axiosClient.post<ApiResponse<CheckoutResponse>>(CHECKOUT_URL, body);
  if (!data.success) throw new Error(data.message || 'Thanh toán thất bại');
  return data.data;
}
