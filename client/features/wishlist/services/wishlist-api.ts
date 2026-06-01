import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axios-client';
import type { ApiResponse } from '@/types/auth';
import type {
  LegacyWishlistItem,
  WishlistPageResult,
  WishlistQueryParams,
  WishlistToggleResult,
} from '../types';

const WISHLIST_API_BASE = '/api/v1/products/wishlist';
export const LEGACY_WISHLIST_KEY = 'nexatech_wishlist';

type ProductServiceResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

type WishlistApiEnvelope<T> = ApiResponse<T> | ProductServiceResponse<T>;

function unwrapWishlistResponse<T>(
  payload: WishlistApiEnvelope<T> | undefined,
  fallback: string,
): T {
  if (!payload) {
    throw new Error(fallback);
  }

  if ('code' in payload) {
    if (payload.code === 1000 && payload.result) {
      return payload.result;
    }
    throw new Error(payload.message || fallback);
  }

  if ('success' in payload) {
    if (payload.success && payload.data) {
      return payload.data;
    }
    throw new Error(payload.message || fallback);
  }

  throw new Error(fallback);
}

export function getWishlistErrorMessage(
  error: unknown,
  fallback = 'Không thể cập nhật danh sách yêu thích',
): string {
  if (!isAxiosError(error)) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('token refresh') || message.includes('No refresh token')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    return message || fallback;
  }
  const data = error.response?.data as WishlistApiEnvelope<unknown> | undefined;
  if (error.response?.status === 401) {
    return 'Vui lòng đăng nhập để cập nhật danh sách yêu thích';
  }
  if (error.response?.status === 403) {
    return 'Tài khoản không có quyền cập nhật danh sách yêu thích';
  }
  return data?.message || error.message || fallback;
}

function buildWishlistQuery(params?: WishlistQueryParams): string {
  const query = new URLSearchParams();
  query.set('page', String(params?.page ?? 0));
  query.set('size', String(params?.size ?? 20));
  query.set('sort', params?.sort ?? 'createdAt,desc');
  return `?${query.toString()}`;
}

export async function addToWishlist(productId: string): Promise<WishlistToggleResult> {
  const { data } = await axiosClient.post<WishlistApiEnvelope<WishlistToggleResult>>(
    `${WISHLIST_API_BASE}/${encodeURIComponent(productId)}`,
  );
  return unwrapWishlistResponse(data, 'Không thể thêm vào yêu thích');
}

export async function removeFromWishlist(productId: string): Promise<WishlistToggleResult> {
  const { data } = await axiosClient.delete<WishlistApiEnvelope<WishlistToggleResult>>(
    `${WISHLIST_API_BASE}/${encodeURIComponent(productId)}`,
  );
  return unwrapWishlistResponse(data, 'Không thể xóa khỏi yêu thích');
}

export async function getWishlist(
  params?: WishlistQueryParams,
): Promise<WishlistPageResult> {
  const { data } = await axiosClient.get<WishlistApiEnvelope<WishlistPageResult>>(
    `${WISHLIST_API_BASE}${buildWishlistQuery(params)}`,
  );

  return unwrapWishlistResponse(data, 'Không thể tải danh sách yêu thích');
}

export async function getAllWishlistedProductIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  let page = 0;
  const size = 100;

  // Pull all pages so card/detail icon state can be hydrated from backend only.
  for (let i = 0; i < 20; i += 1) {
    const result = await getWishlist({ page, size, sort: 'createdAt,desc' });
    for (const item of result.content) {
      if (item.id) ids.add(item.id);
    }
    if (result.last || page >= result.totalPages - 1) {
      break;
    }
    page += 1;
  }

  return ids;
}

export function readLegacyWishlistProductIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(LEGACY_WISHLIST_KEY);
    if (!raw) return [];

    const list = JSON.parse(raw) as LegacyWishlistItem[];
    if (!Array.isArray(list)) return [];

    return Array.from(
      new Set(
        list
          .map((item) => item?.productId?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    );
  } catch {
    return [];
  }
}

export async function migrateLegacyWishlistToBackend(): Promise<boolean> {
  const productIds = readLegacyWishlistProductIds();
  if (productIds.length === 0) return false;

  const results = await Promise.allSettled(productIds.map((productId) => addToWishlist(productId)));
  const allSucceeded = results.every((result) => result.status === 'fulfilled');

  if (typeof window !== 'undefined' && allSucceeded) {
    localStorage.removeItem(LEGACY_WISHLIST_KEY);
  }

  return allSucceeded;
}
