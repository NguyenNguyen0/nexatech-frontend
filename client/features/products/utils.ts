import type { PageResult, ProductListParams, StockStatus } from './types';

function appendParam(params: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

export function buildProductQuery(params?: ProductListParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  appendParam(searchParams, 'page', params.page);
  appendParam(searchParams, 'size', params.size);
  appendParam(searchParams, 'sort', params.sort);
  appendParam(searchParams, 'rating', params.rating);
  appendParam(searchParams, 'categoryId', params.categoryId);
  appendParam(searchParams, 'subcategoryId', params.subcategoryId);
  appendParam(searchParams, 'brandId', params.brandId);
  appendParam(searchParams, 'minPrice', params.minPrice);
  appendParam(searchParams, 'maxPrice', params.maxPrice);
  appendParam(searchParams, 'minRating', params.minRating);
  appendParam(searchParams, 'maxRating', params.maxRating);
  appendParam(searchParams, 'featured', params.featured);
  appendParam(searchParams, 'keyword', params.keyword);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function unwrapProductApiResponse<T>(payload: unknown): T {
  if (Array.isArray(payload)) {
    return payload as T;
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Phan hoi product API khong hop le');
  }

  const response = payload as {
    status?: unknown;
    message?: unknown;
    data?: unknown;
    success?: unknown;
    code?: unknown;
    result?: unknown;
  };

  if (typeof response.status === 'number' && 'data' in response) {
    if (response.status < 200 || response.status >= 400) {
      throw new Error(typeof response.message === 'string' && response.message ? response.message : 'Product API request failed');
    }
    return response.data as T;
  }

  if (typeof response.success === 'boolean' && 'data' in response) {
    if (!response.success) {
      throw new Error(typeof response.message === 'string' && response.message ? response.message : 'Product API request failed');
    }
    return response.data as T;
  }

  if (typeof response.code === 'number' && 'result' in response) {
    if (response.code !== 1000) {
      throw new Error(typeof response.message === 'string' && response.message ? response.message : 'Product API request failed');
    }
    return response.result as T;
  }

  if ('data' in response) {
    return response.data as T;
  }

  throw new Error('Phan hoi product API thieu wrapper status/data');
}

export function normalizeCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  for (const key of ['items', 'content', 'results', 'data']) {
    const value = record[key];
    if (Array.isArray(value)) return value as T[];
  }

  return [];
}

export function normalizePageResult<T>(payload: unknown): PageResult<T> {
  const items = normalizeCollection<T>(payload);
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};

  const readNumber = (...keys: string[]): number | undefined => {
    for (const key of keys) {
      const raw = record[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
      if (typeof raw === 'string' && raw.trim()) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return undefined;
  };

  const page = readNumber('page', 'pageNumber', 'currentPage') ?? 1;
  const size = readNumber('size', 'pageSize', 'limit') ?? (items.length || 0);

  return {
    items,
    page,
    size,
    totalItems: readNumber('totalItems', 'totalElements', 'totalCount'),
    totalPages: readNumber('totalPages', 'pages', 'pageCount'),
    hasNext: typeof record.hasNext === 'boolean' ? record.hasNext : undefined,
    raw: payload,
  };
}

export function toStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value && value.trim() ? value : undefined;
}

export function toNumberParam(value: string | string[] | undefined, fallback?: number): number | undefined {
  const resolved = toStringParam(value);
  if (!resolved) return fallback;
  const parsed = Number(resolved);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getStockStatusLabel(status?: StockStatus): string {
  switch (status) {
    case 'IN_STOCK':
      return 'Còn hàng';
    case 'LOW_STOCK':
      return 'Sắp hết';
    case 'OUT_OF_STOCK':
      return 'Hết hàng';
    default:
      return 'Sẵn sàng';
  }
}

export function getStockStatusClassName(status?: StockStatus): string {
  switch (status) {
    case 'IN_STOCK':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    case 'LOW_STOCK':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    case 'OUT_OF_STOCK':
      return 'bg-danger/10 text-danger';
    default:
      return 'bg-primary/10 text-primary';
  }
}
