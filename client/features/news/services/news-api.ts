import type { ApiResponse } from '@/types/auth';
import type { NewsDetail, NewsListItem } from '../types';

const NEWS_API_BASE = '/api/v1/news';
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL?.replace(/\/$/, '') ?? 'http://localhost:8080';

function resolveApiPath(path: string): string {
  if (path.startsWith('/')) {
    return `${API_GATEWAY_URL}${path}`;
  }

  return path;
}

async function requestNewsApi<T>(path: string): Promise<T> {
  const response = await fetch(resolveApiPath(path), {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  if (!payload || payload.code !== 1000 || payload.result === undefined) {
    throw new Error(payload?.message || 'Khong the tai tin tuc');
  }

  return payload.result;
}

export async function fetchPublicNews(): Promise<NewsListItem[]> {
  return requestNewsApi<NewsListItem[]>(`${NEWS_API_BASE}/public`);
}

export async function fetchPublicNewsBySlug(slug: string): Promise<NewsDetail> {
  return requestNewsApi<NewsDetail>(
    `${NEWS_API_BASE}/public/${encodeURIComponent(slug)}`
  );
}
