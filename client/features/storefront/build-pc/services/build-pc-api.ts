import { normalizeCollection, normalizePageResult } from '@/features/products/utils';
import { formatCurrency } from '@/lib/utils';
import { resolveBackendBaseUrl } from '@/lib/server-env';
import type { PageResult, ProductMinimal } from '@/features/products/types';
import type { CatalogItem, CatalogPageResult, PartKey, SuggestedBuild } from '../types';

const PART_CATEGORY_SLUGS: PartKey[] = [
  'cpu',
  'mainboard',
  'vga',
  'ram',
  'hdd',
  'ssd',
  'pc-case',
  'monitor',
  'power-supply-psu',
  'mouse',
  'keyboard',
  'chair',
  'headphones',
];
const PART_SLUG_ALIASES: Record<string, PartKey> = {
  motherboard: 'mainboard',
  'bo-mach-chu': 'mainboard',
  gpu: 'vga',
  'graphics-card': 'vga',
  'card-man-hinh': 'vga',
  'pc-case': 'pc-case',
  case: 'pc-case',
  'vo-may-tinh': 'pc-case',
  monitor: 'monitor',
  psu: 'power-supply-psu',
  'power-supply-psu': 'power-supply-psu',
  'nguon-may-tinh': 'power-supply-psu',
  chuot: 'mouse',
  'chuot-may-tinh': 'mouse',
  mouse: 'mouse',
  'ban-phim': 'keyboard',
  'ban-phim-may-tinh': 'keyboard',
  keyboard: 'keyboard',
  ghe: 'chair',
  'ghe-gaming': 'chair',
  chair: 'chair',
  'tai-nghe': 'headphones',
  'tai-nghe-may-tinh': 'headphones',
  headset: 'headphones',
  headphones: 'headphones',
};
const PART_FETCH_SLUGS: Record<PartKey, string[]> = {
  cpu: ['cpu'],
  mainboard: ['mainboard', 'motherboard', 'bo-mach-chu'],
  vga: ['vga', 'gpu', 'graphics-card', 'card-man-hinh'],
  ram: ['ram'],
  hdd: ['hdd'],
  ssd: ['ssd'],
  'pc-case': ['pc-case', 'case', 'vo-may-tinh', 'case-asus', 'case-corsair', 'case-lian-li', 'case-nzxt'],
  monitor: ['monitor'],
  'power-supply-psu': [
    'power-supply-psu',
    'psu',
    'nguon-may-tinh',
    'nguon-corsair',
    'nguon-may-tinh-asus',
    'psu-nguon-may-tinh-deepcool',
    'psu-nguon-may-tinh-msi',
    'nguon-may-tinh-nzxt',
  ],
  mouse: ['mouse', 'chuot', 'chuot-may-tinh'],
  keyboard: ['keyboard', 'ban-phim', 'ban-phim-may-tinh'],
  chair: ['chair', 'ghe', 'ghe-gaming'],
  headphones: ['headphones', 'tai-nghe', 'tai-nghe-may-tinh'],
};

type ApiProduct = ProductMinimal & {
  specs?: Record<string, string | number | boolean | null | undefined>;
};

type PagedResponse = {
  items?: ApiProduct[];
  content?: ApiProduct[];
  results?: ApiProduct[];
  data?: ApiProduct[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
};

function resolveUrl(path: string): string {
  return `${resolveBackendBaseUrl()}/api/v1${path}`;
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = resolveUrl(path);

  if (process.env.NODE_ENV === 'development') {
    console.debug(`[REAL API] [Build PC API] GET ${url}`);
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
      // Keep status message when the body is not JSON.
    }
    throw new Error(message);
  }

  return unwrapResponse<T>(await response.json());
}

function unwrapResponse<T>(payload: unknown): T {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Build PC API: phản hồi không hợp lệ');
  }

  const p = payload as Record<string, unknown>;

  if (typeof p.code === 'number' && 'result' in p) {
    if (p.code !== 1000) {
      throw new Error(typeof p.message === 'string' && p.message ? p.message : `Build PC API error (code ${p.code})`);
    }
    return p.result as T;
  }

  if (typeof p.status === 'number' && 'data' in p) {
    if (p.status < 200 || p.status >= 400) {
      throw new Error(typeof p.message === 'string' && p.message ? p.message : `Build PC API error (status ${p.status})`);
    }
    return p.data as T;
  }

  if (typeof p.success === 'boolean' && 'data' in p) {
    if (!p.success) {
      throw new Error(typeof p.message === 'string' && p.message ? p.message : 'Build PC API error');
    }
    return p.data as T;
  }

  return payload as T;
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function derivePartKey(categorySlugs: string[] = []): PartKey | undefined {
  for (const rawSlug of categorySlugs) {
    const slug = rawSlug.trim().toLowerCase();
    if ((PART_CATEGORY_SLUGS as string[]).includes(slug)) {
      return slug as PartKey;
    }

    const alias = PART_SLUG_ALIASES[slug];
    if (alias) return alias;
  }

  return undefined;
}

function readSpec(product: ApiProduct, keys: string[]): string {
  const specs = product.specs ?? {};
  for (const key of keys) {
    const value = specs[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '';
}

function matchFirst(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/\s+/g, ' ');
    if (match?.[0]) return match[0].trim().replace(/\s+/g, ' ');
  }
  return '';
}

function deriveSeries(product: ApiProduct, partKey: PartKey): string {
  const name = product.name;
  const brand = product.brandName ?? '';
  const withoutBrand = brand ? name.replace(new RegExp(`^${escapeRegExp(brand)}\\s+`, 'i'), '') : name;

  if (partKey === 'cpu') {
    return readSpec(product, ['dong_cpu', 'series', 'cpu']) || matchFirst(name, [
      /\b(Core\s+Ultra\s+\d)\b/i,
      /\b(Core\s+i[3579])\b/i,
      /\b(Ryzen\s+[3579])\b/i,
      /\b(Pentium\s+Gold)\b/i,
    ]);
  }

  if (partKey === 'mainboard') {
    return readSpec(product, ['chipset', 'series']) || matchFirst(name, [
      /\b([A-Z]\d{3,4}[A-Z]?(?:E)?)\b/i,
      /\b(TRX50|WRX90|W790)\b/i,
    ]);
  }

  if (partKey === 'vga') {
    return readSpec(product, ['gpu', 'chipset', 'series']) || matchFirst(name, [
      /\b(GeForce\s+RTX\s+\d{4}(?:\s+Ti| SUPER)?)\b/i,
      /\b(Radeon\s+RX\s+\d{4}\s?XT?)\b/i,
      /\b(Intel\s+Arc\s+[A-Z]\d{3})\b/i,
      /\b(RTX\s+\d{4}(?:\s+Ti| SUPER)?)\b/i,
    ]);
  }

  if (partKey === 'power-supply-psu') {
    return readSpec(product, ['series', 'watts', 'cong_suat']) || matchFirst(name, [
      /\b(\d{3,4}W)\b/i,
      /\b(80\s*Plus\s+\w+)\b/i,
    ]);
  }

  if (partKey === 'ssd' || partKey === 'hdd') {
    return readSpec(product, ['capacity', 'dung_luong', 'series']) || matchFirst(name, [
      /\b(\d+(?:GB|TB))\b/i,
      /\b(NVMe|SATA|M\.2|PCIe\s+\w+)\b/i,
    ]);
  }

  if (partKey === 'pc-case') {
    return readSpec(product, ['form_factor', 'series']) || matchFirst(name, [
      /\b(ATX|Micro-ATX|M-ATX|Mini-ITX|E-ATX)\b/i,
    ]);
  }

  if (partKey === 'mouse') {
    return readSpec(product, ['series', 'ket_noi', 'connection']) || matchFirst(name, [
      /\b(Wireless|Bluetooth|Tri-mode|Wired)\b/i,
      /\b([A-Z]\d{1,3}\s?(?:Pro|Max|Ultra)?)\b/i,
    ]);
  }

  if (partKey === 'keyboard') {
    return readSpec(product, ['switch', 'layout', 'series']) || matchFirst(name, [
      /\b(Fullsize|TKL|Tenkeyless|75%|65%|60%)\b/i,
      /\b(RGB|Wireless|Tri-mode|Bluetooth)\b/i,
    ]);
  }

  if (partKey === 'chair') {
    return readSpec(product, ['series', 'chat_lieu', 'material']) || matchFirst(name, [
      /\b(Ergonomic|Gaming|Công thái học|Lưới|Da)\b/i,
    ]);
  }

  if (partKey === 'headphones') {
    return readSpec(product, ['series', 'ket_noi', 'connection']) || matchFirst(name, [
      /\b(Wireless|Bluetooth|USB|3\.5mm|ANC|RGB)\b/i,
      /\b(Cloud|Kraken|BlackShark|Zone|WH\d+)\b/i,
    ]);
  }

  return readSpec(product, ['series']) || matchFirst(withoutBrand, [/^([A-Za-z0-9][A-Za-z0-9\s-]{1,24})/]);
}

function mapToCatalogItem(product: ApiProduct): CatalogItem | null {
  const partKey = derivePartKey(product.categorySlugs);
  if (!partKey) return null;
  const badge = product.tags?.find((tag) => !['build-pc-part', partKey].includes(tag) && !tag.endsWith('-import'));
  const series = deriveSeries(product, partKey);

  return {
    id: product.id,
    partKey,
    name: product.name,
    slug: product.slug || slugify(product.name),
    brand: product.brandName ?? '',
    series,
    compatibility: '',
    averageRating: product.averageRating ?? 0,
    price: product.price,
    originalPrice: product.compareAtPrice ?? product.originalPrice,
    badge,
    image: product.thumbnail,
  };
}

function mapToSuggestedBuild(product: ApiProduct): SuggestedBuild {
  const price = product.price;
  const originalPrice = product.compareAtPrice ?? product.originalPrice ?? price;
  const savings = originalPrice - price;
  const discountPct = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  return {
    id: product.id,
    slug: product.slug || slugify(product.name),
    name: product.name,
    specs: [],
    price,
    originalPrice,
    discountLabel: discountPct > 0 ? `-${discountPct}%` : '',
    savingsLabel: savings > 0 ? `Tiết kiệm ${formatCurrency(savings)}` : '',
    image: product.thumbnail ?? '',
  };
}

function readItems(response: ApiProduct[] | PagedResponse, errorMessage: string): ApiProduct[] {
  const items = Array.isArray(response) ? response : normalizeCollection<ApiProduct>(response);
  if (!Array.isArray(items)) {
    throw new Error(errorMessage);
  }
  return items;
}

function mapCatalogPageResult(result: PageResult<ApiProduct>): CatalogPageResult {
  return {
    items: result.items.flatMap((product) => {
      const item = mapToCatalogItem(product);
      return item ? [item] : [];
    }),
    page: result.page,
    size: result.size,
    totalItems: result.totalItems,
    totalPages: result.totalPages ?? 1,
    hasNext: result.hasNext,
  };
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

async function fetchProductsPageResult(path: string): Promise<PageResult<ApiProduct>> {
  const response = await apiFetch<ApiProduct[] | PagedResponse>(path);
  return normalizePageResult<ApiProduct>(response);
}

async function fetchProductsByCategorySlug(slug: string, page?: number): Promise<PageResult<ApiProduct>> {
  return fetchProductsPageResult(`/products${buildQuery({ categorySlug: slug, size: 10, page })}`);
}

async function fetchPartCatalogBySlugs(slugs: string[]): Promise<ApiProduct[]> {
  for (const slug of slugs) {
    try {
      const result = await fetchProductsByCategorySlug(slug, 0);
      if (result.items.length > 0) return result.items;
    } catch {
      // Try the next alias when a legacy slug is not present in the real catalog.
    }
  }

  return [];
}

function dedupeProducts(products: ApiProduct[]): ApiProduct[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = product.id || product.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchBuildPcSuggestions(categorySlug?: string): Promise<SuggestedBuild[]> {
  const taggedProducts = await fetchProductsPage(
    `/products${buildQuery({ tags: 'suggested-build', categorySlug, size: 12 })}`,
  );
  if (taggedProducts.length > 0) {
    return taggedProducts.map(mapToSuggestedBuild);
  }

  const fallbackProducts = await fetchProductsPage(`/products${buildQuery({ categorySlug, size: 12 })}`);
  return fallbackProducts.map(mapToSuggestedBuild);
}

export async function fetchBuildPcCatalog(): Promise<CatalogItem[]> {
  const pages = await Promise.all(
    PART_CATEGORY_SLUGS.map((partKey) => fetchPartCatalogBySlugs(PART_FETCH_SLUGS[partKey])),
  );

  return dedupeProducts(pages.flat()).flatMap((product) => {
    const item = mapToCatalogItem(product);
    return item ? [item] : [];
  });
}

export async function fetchPartsByKey(partKey: PartKey, page: number = 0): Promise<CatalogPageResult> {
  for (const slug of PART_FETCH_SLUGS[partKey]) {
    try {
      const result = await fetchProductsByCategorySlug(slug, page);
      if (result.items.length > 0 || typeof result.totalPages === 'number') {
        return mapCatalogPageResult(result);
      }
    } catch {
      // Try the next alias.
    }
  }

  return { items: [], page, size: 10, totalPages: 1, totalItems: 0, hasNext: false };
}
