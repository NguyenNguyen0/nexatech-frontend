/**
 * Checkout API service.
 * POST /api/v1/checkout — tạo đơn hàng từ giỏ hàng hiện tại.
 *
 * Gợi ý: truyền `idempotencyKey` (UUID) khi gọi để tránh tạo đơn trùng khi retry.
 * Nếu paymentMethod = VNPAY, response sẽ có `paymentUrl` → redirect người dùng.
 */

import axiosClient from '@/lib/axios-client';
import type { OrderApiResponse, CheckoutRequest, CheckoutResponse } from '@/types/order';
import { CHECKOUT_API_BASE } from '@/lib/constants';

export async function checkout(
  request: CheckoutRequest,
  idempotencyKey?: string,
): Promise<CheckoutResponse> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const { data } = await axiosClient.post<OrderApiResponse<CheckoutResponse>>(
    CHECKOUT_API_BASE,
    request,
    { headers },
  );

  if (!data.success || !data.data) throw new Error(data.message ?? 'Checkout thất bại');
  return data.data;
}
