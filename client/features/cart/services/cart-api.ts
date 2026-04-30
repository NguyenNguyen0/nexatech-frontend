import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axios-client';
import type { ApiResponse } from '@/types/auth';
import type { Cart, UpdateCartItemBody } from '@/types/cart';

const CART_API_BASE = '/api/v1/cart';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Có lỗi xảy ra. Vui lòng thử lại.',
): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as ApiResponse<unknown> | undefined;
  return data?.message || error.message || fallback;
}

export async function getCart(): Promise<Cart> {
  const { data } = await axiosClient.get<ApiResponse<Cart>>(CART_API_BASE);
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Không thể tải giỏ hàng');
  }
  return data.result;
}

export async function updateCartItem(
  productId: string,
  body: UpdateCartItemBody,
): Promise<Cart> {
  const { data } = await axiosClient.put<ApiResponse<Cart>>(
    `${CART_API_BASE}/items/${productId}`,
    body,
  );
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Cập nhật số lượng thất bại');
  }
  return data.result;
}

export async function removeCartItem(productId: string): Promise<Cart> {
  const { data } = await axiosClient.delete<ApiResponse<Cart>>(
    `${CART_API_BASE}/items/${productId}`,
  );
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Xóa sản phẩm thất bại');
  }
  return data.result;
}

export async function clearCart(): Promise<void> {
  const { data } = await axiosClient.delete<ApiResponse<void>>(CART_API_BASE);
  if (data.code !== 1000) {
    throw new Error(data.message || 'Xóa giỏ hàng thất bại');
  }
}
