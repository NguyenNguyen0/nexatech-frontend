import { featureFlags, getMockApiIndicator } from '@/lib/feature-flags';
import { normalizeCollection } from '@/features/products/utils';
import { formatCurrency } from '@/lib/utils';
import type { CatalogItem, PartKey, SuggestedBuild } from '../types';

// ── URL resolution ────────────────────────────────────────────────────────────

const MOCK_BASE = '/api/v1';
const PART_CATEGORY_SLUGS: PartKey[] = ['cpu', 'pc-case', 'ram', 'hdd', 'ssd', 'monitor', 'power-supply-psu'];
const PART_SLUG_ALIASES: Record<string, PartKey> = {
  mainboard: 'pc-case',
  'pc-case': 'pc-case',
  gpu: 'monitor',
  vga: 'monitor',
  monitor: 'monitor',
  psu: 'power-supply-psu',
  'power-supply-psu': 'power-supply-psu',
};
const PART_FETCH_SLUGS: Record<PartKey, string[]> = {
  cpu: ['cpu'],
  'pc-case': ['pc-case', 'mainboard'],
  ram: ['ram'],
  hdd: ['hdd'],
  ssd: ['ssd'],
  monitor: ['monitor', 'gpu', 'vga'],
  'power-supply-psu': ['power-supply-psu', 'psu'],
};

/**
 * For client-side Build PC calls:
 * - USE_MOCK_API=true  → relative /api/v1/products* (served by local mock route)
 * - USE_MOCK_API=false → absolute http://{backend}/api/v1/products* (real product API)
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
    cache: 'no-store',
    credentials: 'include',
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

  // { success, data, message, timestamp }
  if (typeof p['success'] === 'boolean' && 'data' in p) {
    if (!p['success']) {
      throw new Error(
        typeof p['message'] === 'string' && p['message']
          ? p['message']
          : 'Build PC API error',
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
  averageRating?: number;
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
  content?: ApiProduct[];
  results?: ApiProduct[];
  data?: ApiProduct[];
};

// ── Mappers ───────────────────────────────────────────────────────────────────

function derivePartKey(categorySlugs: string[] = []): PartKey | undefined {
  for (const rawSlug of categorySlugs) {
    const slug = rawSlug.trim().toLowerCase();
    if ((PART_CATEGORY_SLUGS as string[]).includes(slug)) {
      return slug as PartKey;
    }

    const alias = PART_SLUG_ALIASES[slug];
    if (alias) {
      return alias;
    }
  }

  return undefined;
}

function readSpecValue(specs: ApiProduct['specs'], ...candidates: string[]): string {
  if (!specs) return '';

  for (const candidate of candidates) {
    const direct = specs[candidate];
    if (typeof direct === 'string' && direct.trim()) {
      return direct;
    }

    const matchedKey = Object.keys(specs).find((key) => key.toLowerCase() === candidate.toLowerCase());
    if (matchedKey) {
      const matchedValue = specs[matchedKey];
      if (typeof matchedValue === 'string' && matchedValue.trim()) {
        return matchedValue;
      }
    }
  }

  return '';
}

function mapToCatalogItem(p: ApiProduct): CatalogItem | null {
  const partKey = derivePartKey(p.categorySlugs);
  if (!partKey) return null;

  return {
    id: p.id,
    partKey,
    name: p.name,
    brand: p.brandName ?? '',
    series: readSpecValue(p.specs, 'series', 'Series'),
    compatibility: readSpecValue(p.specs, 'compatibility', 'Compatibility'),
    averageRating: p.averageRating ?? 0,
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
  for (const key of ['CPU', 'GPU', 'RAM']) {
    const value = readSpecValue(p.specs, key, key.toLowerCase());
    if (value) specItems.push(value);
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

function readItems(response: ApiProduct[] | PagedResponse, errorMessage: string): ApiProduct[] {
  const items = Array.isArray(response) ? response : normalizeCollection<ApiProduct>(response);
  if (!Array.isArray(items)) {
    throw new Error(errorMessage);
  }
  return items;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function fetchProductsPage(path: string): Promise<ApiProduct[]> {
  const response = await apiFetch<ApiProduct[] | PagedResponse>(path);
  return readItems(response, 'Build PC API: danh sách sản phẩm có định dạng không hợp lệ');
}

async function fetchProductsByCategorySlug(slug: string): Promise<ApiProduct[]> {
  return fetchProductsPage(`/products/category/slug/${encodeURIComponent(slug)}${buildQuery({ size: 100 })}`);
}

async function fetchPartCatalogBySlugs(slugs: string[]): Promise<ApiProduct[]> {
  for (const slug of slugs) {
    try {
      const products = await fetchProductsByCategorySlug(slug);
      if (products.length > 0) {
        return products;
      }
    } catch {
      // A missing legacy slug (404) should not fail the whole Build PC catalog flow.
      // Continue probing other aliases for this part.
    }
  }

  return [];
}

function dedupeProducts(products: ApiProduct[]): ApiProduct[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = product.id || product.name;
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Fetch suggested pre-built PC configurations. */
export async function fetchBuildPcSuggestions(categorySlug?: string): Promise<SuggestedBuild[]> {
  const query = buildQuery({
    tags: 'suggested-build',
    categorySlug,
    size: 12,
  });
  const taggedProducts = await fetchProductsPage(`/products${query}`);
  if (taggedProducts.length > 0) {
    return taggedProducts.map(mapToSuggestedBuild);
  }

  const fallbackQuery = buildQuery({
    categorySlug,
    size: 12,
  });
  const fallbackProducts = await fetchProductsPage(`/products${fallbackQuery}`);
  return fallbackProducts.map(mapToSuggestedBuild);
}

/** Fetch all PC part catalog items (CPU / PC Case / RAM / SSD / HDD / Monitor / PSU). */
export async function fetchBuildPcCatalog(): Promise<CatalogItem[]> {
  const pages = await Promise.all(
    PART_CATEGORY_SLUGS.map((partKey) =>
      fetchPartCatalogBySlugs(PART_FETCH_SLUGS[partKey]),
    ),
  );

  return dedupeProducts(pages.flat()).flatMap((p) => {
    const item = mapToCatalogItem(p);
    return item ? [item] : [];
  });
}
