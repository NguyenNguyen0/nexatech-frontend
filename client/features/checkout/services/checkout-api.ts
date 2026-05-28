/**
 * Checkout API service.
 * POST /api/v1/checkout - tao don hang tu gio hang hien tai.
 *
 * Truyen `idempotencyKey` (UUID) khi goi de tranh tao don trung khi retry.
 * Neu paymentMethod = VNPAY, response co `paymentUrl` de redirect nguoi dung.
 */

import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axios-client';
import type { OrderApiResponse, CheckoutRequest, CheckoutResponse } from '@/types/order';
import { CHECKOUT_API_BASE } from '@/lib/constants';

export class CheckoutUnavailableError extends Error {
  constructor(message = 'Thanh toán này không khả dụng, hãy đợi một chút rồi thử lại.') {
    super(message);
    this.name = 'CheckoutUnavailableError';
  }
}

function readCheckoutErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
  }

  const data = error.response?.data as
    | { message?: string; error?: string; status?: number }
    | undefined;

  return data?.message || data?.error || error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
}

function isPaymentUnavailableError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;

  const status = error.response?.status;
  const message = readCheckoutErrorMessage(error).toLowerCase();

  return (
    status === 503 ||
    message.includes('payment unavailable') ||
    message.includes('payment service unavailable') ||
    message.includes('payment_unavailable') ||
    message.includes('thanh toán này không khả dụng')
  );
}

export async function checkout(
  request: CheckoutRequest,
  idempotencyKey?: string,
): Promise<CheckoutResponse> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  try {
    const { data } = await axiosClient.post<OrderApiResponse<CheckoutResponse>>(
      CHECKOUT_API_BASE,
      request,
      { headers },
    );

    if (!data.success || !data.data) throw new Error(data.message ?? 'Checkout thất bại');
    return data.data;
  } catch (error) {
    if (isPaymentUnavailableError(error)) {
      throw new CheckoutUnavailableError();
    }
    throw new Error(readCheckoutErrorMessage(error));
  }
}
