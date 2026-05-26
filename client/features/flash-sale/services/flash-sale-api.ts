import type {
  CouponValidateRequest,
  CouponValidateResponse,
  FlashSaleListResponse,
  FlashSaleReservationResponse,
  FlashSaleResponse,
  PromotionApiResponse,
} from '@/types/promotion';

const PROMOTION_API_BASE = '/api/v1/promotions';
const FLASH_SALE_API_BASE = '/api/v1/flash-sales';

async function promotionFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, cache: 'no-store' });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message ?? `HTTP ${res.status}`);
  }

  const body = (await res.json()) as PromotionApiResponse<T>;

  if (!body.success) {
    throw new Error((body as any).message ?? 'Promotion service error');
  }

  return body.data;
}

export async function getActiveFlashSales(page = 0, size = 10): Promise<FlashSaleListResponse> {
  return promotionFetch<FlashSaleListResponse>(
    `${FLASH_SALE_API_BASE}?page=${page}&size=${size}&status=ACTIVE`,
  );
}

export async function getFlashSaleById(id: string): Promise<FlashSaleResponse> {
  return promotionFetch<FlashSaleResponse>(`${FLASH_SALE_API_BASE}/${id}`);
}

export async function reserveFlashSaleSlot(
  flashSaleId: string,
  token: string,
): Promise<FlashSaleReservationResponse> {
  return promotionFetch<FlashSaleReservationResponse>(`${FLASH_SALE_API_BASE}/${flashSaleId}/reserve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function validateCoupon(
  payload: CouponValidateRequest,
  token: string,
): Promise<CouponValidateResponse> {
  return promotionFetch<CouponValidateResponse>(`${PROMOTION_API_BASE}/validate-coupon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Notify the promotion service that `quantity` units of a flash sale product
 * have been sold. Fires-and-forgets — errors are silently swallowed so they
 * never block the checkout success flow.
 */
export async function notifyFlashSaleSold(
  productId: string,
  quantity: number,
): Promise<void> {
  try {
    await fetch(`${FLASH_SALE_API_BASE}/by-product/${productId}/sell`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
  } catch {
    // intentionally silenced — stock decrement is best-effort
  }
}
