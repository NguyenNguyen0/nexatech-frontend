/**
 * Cart service — Local Storage implementation for mock/dev testing.
 * Mirrors the same function signatures as the real cart-api (axios) so
 * components stay unchanged when switching to real API.
 */

import type { Cart, CartItem, UpdateCartItemBody } from '@/types/cart';

const STORAGE_KEY = 'nexatech_cart';

// ── helpers ─────────────────────────────────────────────────────────────────

function readCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], totalItems: 0, totalAmount: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], totalItems: 0, totalAmount: 0 };
    return JSON.parse(raw) as Cart;
  } catch {
    return { items: [], totalItems: 0, totalAmount: 0 };
  }
}

function writeCart(cart: Cart): Cart {
  const totals: Cart = {
    ...cart,
    totalItems: cart.items.reduce((s, i) => s + i.quantity, 0),
    totalAmount: cart.items.reduce((s, i) => s + i.totalPrice, 0),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(totals));
  }
  // Dispatch storage event so other tabs / header badge can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'));
  }
  return totals;
}

async function fetchProductMeta(productId: string): Promise<{ name: string; image: string; price: number } | null> {
  try {
    const res = await fetch(`/api/v1/products/${productId}`);
    if (!res.ok) return null;
    const json = await res.json();
    const p = json?.data ?? json?.result ?? json;
    return {
      name: p.name ?? 'Sản phẩm',
      image: (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.thumbnail ?? ''),
      price: p.price ?? 0,
    };
  } catch {
    return null;
  }
}

// ── public API ───────────────────────────────────────────────────────────────

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export async function getCart(): Promise<Cart> {
  return readCart();
}

export async function updateCartItem(productId: string, body: UpdateCartItemBody): Promise<Cart> {
  const cart = readCart();
  const { quantity, priceOverride } = body;

  if (quantity <= 0) {
    return removeCartItem(productId);
  }

  const existingIndex = cart.items.findIndex((i) => i.productId === productId);

  if (existingIndex >= 0) {
    const existing = cart.items[existingIndex];
    // Use priceOverride if provided, otherwise keep the existing price
    const price = priceOverride ?? existing.price;
    cart.items[existingIndex] = {
      ...existing,
      quantity,
      price,
      totalPrice: price * quantity,
    };
  } else {
    // Fetch product metadata to enrich cart item (only if no priceOverride)
    const meta = priceOverride == null ? await fetchProductMeta(productId) : null;
    const price = priceOverride ?? meta?.price ?? 0;

    const newItem: CartItem = {
      productId,
      productName: meta?.name ?? 'Sản phẩm',
      productImage: meta?.image ?? '',
      quantity,
      price,
      totalPrice: price * quantity,
    };
    cart.items.push(newItem);
  }

  return writeCart(cart);
}

export async function removeCartItem(productId: string): Promise<Cart> {
  const cart = readCart();
  cart.items = cart.items.filter((i) => i.productId !== productId);
  return writeCart(cart);
}

export async function clearCart(): Promise<void> {
  writeCart({ items: [], totalItems: 0, totalAmount: 0 });
}
