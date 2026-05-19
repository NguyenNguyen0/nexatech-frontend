import { featureFlags, getMockApiIndicator } from '@/lib/feature-flags';
import { formatCurrency } from '@/lib/utils';
import type { CatalogItem, PartKey, SuggestedBuild } from '../types';

// ── URL resolution ────────────────────────────────────────────────────────────

const MOCK_BASE = '/api/v1';

/**
 * For client-side Build PC calls:
 * - USE_MOCK_API=true  → relative /api/v1/build-pc/* (served by local mock route)
 * - USE_MOCK_API=false → absolute http://{backend}/api/v1/build-pc/* (real API, CORS required)
 */
function resolveUrl(path: string): string {
  if (featureFlags.USE_MOCK_API) {
    return `${MOCK_BASE}${path}`;
  }
  const base =
    (process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080') +
    '/api/v1';
  return `${base}${path}`;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const url = resolveUrl(path);

  if (process.env.NODE_ENV === 'development') {
    console.debug(`${getMockApiIndicator()} [Build PC API] GET ${url}`);
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    let message = `Build PC API: ${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  const payload: unknown = await response.json();
  return unwrapResponse<T>(payload);
}

function unwrapResponse<T>(payload: unknown): T {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Build PC API: phản hồi không hợp lệ');
  }
  const p = payload as Record<string, unknown>;

  // { code, message, result }
  if (typeof p['code'] === 'number' && 'result' in p) {
    if (p['code'] !== 1000) {
      throw new Error(
        typeof p['message'] === 'string' && p['message']
          ? p['message']
          : `Build PC API error (code ${p['code']})`,
      );
    }
    return p['result'] as T;
  }

  // { status, message, data }
  if (typeof p['status'] === 'number' && 'data' in p) {
    if (p['status'] < 200 || p['status'] >= 400) {
      throw new Error(
        typeof p['message'] === 'string' && p['message']
          ? p['message']
          : `Build PC API error (status ${p['status']})`,
      );
    }
    return p['data'] as T;
  }

  // bare array or object passthrough
  return payload as T;
}

// ── Canonical product shape returned by the API ───────────────────────────────

type ApiProduct = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  originalPrice?: number;
  thumbnail?: string;
  images?: string[];
  brandName?: string;
  categorySlugs?: string[];
  tags?: string[];
  specs?: Record<string, string>;
};

type PagedResponse = {
  items: ApiProduct[];
};

// ── Mappers ───────────────────────────────────────────────────────────────────

const PC_PART_KEYS: PartKey[] = ['cpu', 'mainboard', 'ram', 'hdd', 'ssd', 'gpu', 'psu'];

function derivePartKey(categorySlugs: string[] = []): PartKey | undefined {
  return categorySlugs.find((s): s is PartKey => (PC_PART_KEYS as string[]).includes(s));
}

function mapToCatalogItem(p: ApiProduct): CatalogItem | null {
  const partKey = derivePartKey(p.categorySlugs);
  if (!partKey) return null;

  return {
    id: p.id,
    partKey,
    name: p.name,
    brand: p.brandName ?? '',
    series: p.specs?.['Series'] ?? '',
    compatibility: p.specs?.['Compatibility'] ?? '',
    price: p.price,
    originalPrice: p.compareAtPrice ?? p.originalPrice,
    badge: p.tags?.[0],
    image: p.thumbnail ?? p.images?.[0],
  };
}

function mapToSuggestedBuild(p: ApiProduct): SuggestedBuild {
  const price = p.price;
  const originalPrice = p.compareAtPrice ?? p.originalPrice ?? price;
  const savings = originalPrice - price;
  const discountPct = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const specItems: string[] = [];
  const specs = p.specs ?? {};
  for (const key of ['CPU', 'GPU', 'RAM']) {
    if (specs[key]) specItems.push(specs[key]);
  }

  return {
    id: p.id,
    name: p.name,
    specs: specItems,
    price,
    originalPrice,
    discountLabel: discountPct > 0 ? `-${discountPct}%` : '',
    savingsLabel: savings > 0 ? `Tiết kiệm ${formatCurrency(savings)}` : '',
    image: p.thumbnail ?? p.images?.[0] ?? '',
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Fetch suggested pre-built PC configurations. */
export async function fetchBuildPcSuggestions(): Promise<SuggestedBuild[]> {
  const products = await apiFetch<ApiProduct[]>('/build-pc/suggested-builds');
  if (!Array.isArray(products)) {
    throw new Error('Build PC API: suggested-builds có định dạng không hợp lệ');
  }
  return products.map(mapToSuggestedBuild);
}

/** Fetch all PC part catalog items (CPU / Mainboard / RAM / SSD / HDD / GPU / PSU). */
export async function fetchBuildPcCatalog(): Promise<CatalogItem[]> {
  const response = await apiFetch<ApiProduct[] | PagedResponse>('/build-pc/catalog?size=200');
  const items = Array.isArray(response) ? response : (response as PagedResponse).items;
  if (!Array.isArray(items)) {
    throw new Error('Build PC API: catalog có định dạng không hợp lệ');
  }
  return items.flatMap((p) => {
    const item = mapToCatalogItem(p);
    return item ? [item] : [];
  });
}
