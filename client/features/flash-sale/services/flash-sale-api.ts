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
const PENDING_FLASH_SALE_SALES_KEY = 'nexatech_pending_flash_sale_sales';

export interface FlashSaleSoldItem {
  flashSaleId?: string;
  productId: string;
  quantity: number;
}

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

export async function notifyFlashSaleSold(
  productId: string,
  quantity: number,
  flashSaleId?: string,
): Promise<void> {
  try {
    const target = flashSaleId
      ? `${FLASH_SALE_API_BASE}/${flashSaleId}/sell`
      : `${FLASH_SALE_API_BASE}/by-product/${productId}/sell`;

    const res = await fetch(target, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok && flashSaleId) {
      await fetch(`${FLASH_SALE_API_BASE}/by-product/${productId}/sell`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    }
  } catch {
    // Stock decrement is best-effort and must not block checkout completion.
  }
}

function readPendingSales(): Record<string, FlashSaleSoldItem[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PENDING_FLASH_SALE_SALES_KEY);
    return raw ? JSON.parse(raw) as Record<string, FlashSaleSoldItem[]> : {};
  } catch {
    return {};
  }
}

function writePendingSales(data: Record<string, FlashSaleSoldItem[]>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PENDING_FLASH_SALE_SALES_KEY, JSON.stringify(data));
}

export function rememberPendingFlashSaleSales(orderId: string, items: FlashSaleSoldItem[]) {
  if (!items.length) return;
  const pending = readPendingSales();
  pending[orderId] = items;
  writePendingSales(pending);
}

export async function confirmPendingFlashSaleSales(orderId: string): Promise<void> {
  const pending = readPendingSales();
  const items = pending[orderId] ?? [];
  if (!items.length) return;

  await Promise.allSettled(
    items.map((item) => notifyFlashSaleSold(item.productId, item.quantity, item.flashSaleId)),
  );

  delete pending[orderId];
  writePendingSales(pending);
}
