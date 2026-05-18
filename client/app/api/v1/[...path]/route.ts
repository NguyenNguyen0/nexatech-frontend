import { NextResponse } from 'next/server';
import PRODUCTS_RAW from '@/lib/mock-data/products.json';
import CATEGORIES from '@/lib/mock-data/categories.json';
import REVIEWS from '@/lib/mock-data/reviews.json';

// ── Normalize products: ensure thumbnail + specs as object ───────────────────
type RawProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stockQuantity?: number;
  stockStatus?: string;
  images?: string[];
  primaryCategoryId?: string;
  primaryCategoryName?: string;
  categoryIds?: string[];
  categorySlugs?: string[];
  brandId?: string;
  brandName?: string;
  averageRating?: number;
  reviewCount?: number;
  description?: string;
  status?: string;
  tags?: string[];
  specs?: Record<string, string> | Array<{ name: string; value: string }>;
};

function normalizeProduct(p: RawProduct) {
  const thumbnail = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined;

  // Normalize specs: if array [{name,value}] → object
  let specs: Record<string, string> = {};
  if (p.specs) {
    if (Array.isArray(p.specs)) {
      for (const s of p.specs as Array<{ name: string; value: string }>) {
        if (s && s.name) specs[s.name] = s.value ?? '';
      }
    } else {
      specs = p.specs as Record<string, string>;
    }
  }

  return {
    ...p,
    thumbnail,
    compareAtPrice: p.originalPrice,
    specs,
  };
}

const PRODUCTS = (PRODUCTS_RAW as unknown as RawProduct[]).map(normalizeProduct);

// ── helpers ──────────────────────────────────────────────────────────────────

function ok(result: unknown) {
  return NextResponse.json({ code: 1000, message: 'Success', result });
}

function notFound(message = 'Not found') {
  return NextResponse.json({ code: 1404, message }, { status: 404 });
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────────

function handleProducts(sub: string[], url: URL) {
  const keyword = url.searchParams.get('keyword')?.toLowerCase() ?? '';
  const categorySlug = url.searchParams.get('categorySlug') ?? '';
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const size = Math.max(1, Number(url.searchParams.get('size') ?? '12'));

  // /api/v1/products/slug/:slug/related  or  /api/v1/products/slug/:slug/reviews
  if (sub[0] === 'slug' && sub[1] && sub[2]) {
    if (sub[2] === 'related') {
      const product = PRODUCTS.find((p) => p.slug === sub[1] || p.id === sub[1]);
      const related = product
        ? PRODUCTS.filter((p) => p.id !== product.id && p.primaryCategoryId === product.primaryCategoryId).slice(0, 6)
        : [];
      return ok(related);
    }
    if (sub[2] === 'reviews') {
      const productReviews = REVIEWS.filter((r) => {
        const product = PRODUCTS.find((p) => p.slug === sub[1] || p.id === sub[1]);
        return product ? r.productId === product.id : false;
      });
      const ratingFilter = url.searchParams.get('rating');
      const filtered = ratingFilter
        ? productReviews.filter((r) => r.rating === Number(ratingFilter))
        : productReviews;
      return ok({
        items: filtered,
        page: 1,
        size: filtered.length,
        totalItems: filtered.length,
        totalPages: 1,
        hasNext: false,
      });
    }
  }

  // /api/v1/products/slug/:slug
  if (sub[0] === 'slug' && sub[1] && !sub[2]) {
    const product = PRODUCTS.find((p) => p.slug === sub[1] || p.id === sub[1]);
    if (!product) return notFound(`Không tìm thấy sản phẩm: ${sub[1]}`);
    return ok(product);
  }

  // /api/v1/products/:id/related  or  /api/v1/products/:id/reviews
  if (sub[0] && sub[1] === 'related') {
    const product = PRODUCTS.find((p) => p.id === sub[0] || p.slug === sub[0]);
    const related = product
      ? PRODUCTS.filter((p) => p.id !== product.id && p.primaryCategoryId === product.primaryCategoryId).slice(0, 6)
      : [];
    return ok(related);
  }
  if (sub[0] && sub[1] === 'reviews') {
    const productReviews = REVIEWS.filter((r) => r.productId === sub[0]);
    return ok({
      items: productReviews,
      page: 1,
      size: productReviews.length,
      totalItems: productReviews.length,
      totalPages: 1,
      hasNext: false,
    });
  }

  // /api/v1/products/:id — single product by id
  if (sub[0] && !sub[1]) {
    const product = PRODUCTS.find((p) => p.id === sub[0] || p.slug === sub[0]);
    if (!product) return notFound();
    return ok(product);
  }

  // /api/v1/products/suggest
  if (sub[0] === 'suggest') {
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const suggestions = PRODUCTS
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map((p) => ({ id: p.id, name: p.name, slug: p.slug, imageUrl: p.thumbnail, price: p.price }));
    return ok(suggestions);
  }

  // /api/v1/products/featured
  if (sub[0] === 'featured') {
    const featured = PRODUCTS.slice(0, 6);
    return ok({ items: featured, page: 1, size: 6, totalItems: featured.length, totalPages: 1, hasNext: false });
  }

  // /api/v1/products/search
  if (sub[0] === 'search') {
    let filtered = [...PRODUCTS];
    if (keyword) filtered = filtered.filter((p) => p.name.toLowerCase().includes(keyword) || (p.brandName?.toLowerCase() ?? '').includes(keyword));
    return paginate(filtered, page, size);
  }

  // /api/v1/products/category/slug/:slug
  if (sub[0] === 'category' && sub[1] === 'slug' && sub[2]) {
    const filtered = PRODUCTS.filter((p) => (p.categorySlugs ?? []).includes(sub[2]));
    return paginate(filtered, page, size);
  }

  // /api/v1/products — list all with optional filters
  let filtered = [...PRODUCTS];
  if (keyword) filtered = filtered.filter((p) => p.name.toLowerCase().includes(keyword));
  if (categorySlug) filtered = filtered.filter((p) => (p.categorySlugs ?? []).includes(categorySlug));
  return paginate(filtered, page, size);
}

function paginate<T>(items: T[], page: number, size: number) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / size) || 1;
  const start = (page - 1) * size;
  const sliced = items.slice(start, start + size);
  return ok({ items: sliced, page, size, totalItems, totalPages, hasNext: page < totalPages });
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────

function handleCategories(sub: string[]) {
  if (sub[0] === 'menu') return ok(CATEGORIES);
  if (sub[0] === 'slug' && sub[1]) {
    const cat = CATEGORIES.find((c) => c.slug === sub[1]);
    if (!cat) return notFound();
    return ok(cat);
  }
  return ok(CATEGORIES);
}

// ── BUILD PC ──────────────────────────────────────────────────────────────────

const PC_PART_SLUGS = ['cpu', 'mainboard', 'ram', 'ssd', 'hdd', 'gpu', 'psu'] as const;

function handleBuildPc(sub: string[], url: URL) {
  // GET /api/v1/build-pc/parts — static part definitions
  if (sub[0] === 'parts') {
    return ok([
      { key: 'cpu',       label: 'Vi xử lý',     shortLabel: 'CPU',       icon: 'memory',           description: 'Bộ não của toàn bộ hệ thống',          categorySlug: 'cpu' },
      { key: 'mainboard', label: 'Bo mạch chủ',   shortLabel: 'Mainboard', icon: 'developer_board',  description: 'Nền tảng kết nối các linh kiện',       categorySlug: 'mainboard' },
      { key: 'ram',       label: 'RAM',            shortLabel: 'RAM',       icon: 'memory_alt',       description: 'Bộ nhớ đa nhiệm cho máy',              categorySlug: 'ram' },
      { key: 'hdd',       label: 'Ổ HDD',          shortLabel: 'HDD',       icon: 'storage',          description: 'Lưu trữ dung lượng lớn',               categorySlug: 'hdd' },
      { key: 'ssd',       label: 'Ổ SSD',          shortLabel: 'SSD',       icon: 'sd_storage',       description: 'Tăng tốc khởi động và tải ứng dụng',   categorySlug: 'ssd' },
      { key: 'gpu',       label: 'Card đồ họa',    shortLabel: 'VGA',       icon: 'videogame_asset',  description: 'Xử lý hình ảnh và game',               categorySlug: 'gpu' },
      { key: 'psu',       label: 'Nguồn',          shortLabel: 'PSU',       icon: 'power',            description: 'Cấp điện ổn định cho toàn bộ máy',     categorySlug: 'psu' },
    ]);
  }

  // GET /api/v1/build-pc/suggested-builds
  if (sub[0] === 'suggested-builds') {
    const builds = PRODUCTS.filter((p) => (p.tags ?? []).includes('suggested-build'));
    return ok(builds);
  }

  // GET /api/v1/build-pc/catalog
  if (sub[0] === 'catalog') {
    const categorySlug = url.searchParams.get('categorySlug') ?? '';
    const keyword = url.searchParams.get('keyword')?.toLowerCase() ?? '';
    const brandId = url.searchParams.get('brandId') ?? '';
    const minRating = Number(url.searchParams.get('minRating') ?? '0');
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const size = Math.max(1, Number(url.searchParams.get('size') ?? '12'));

    let filtered = PRODUCTS.filter((p) =>
      (p.categorySlugs ?? []).some((s) => (PC_PART_SLUGS as readonly string[]).includes(s)),
    );

    if (categorySlug) filtered = filtered.filter((p) => (p.categorySlugs ?? []).includes(categorySlug));
    if (keyword) filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(keyword) || (p.brandName?.toLowerCase() ?? '').includes(keyword),
    );
    if (brandId) filtered = filtered.filter((p) => p.brandId === brandId);
    if (minRating > 0) filtered = filtered.filter((p) => (p.averageRating ?? 0) >= minRating);

    // specs.<key>=value filters (exact, case-insensitive; multiple values for same key = OR)
    const specsFilter: Record<string, string[]> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key.startsWith('specs.') && value) {
        const specKey = key.slice(6);
        specsFilter[specKey] ??= [];
        specsFilter[specKey].push(value.toLowerCase());
      }
    }
    for (const [specKey, values] of Object.entries(specsFilter)) {
      filtered = filtered.filter((p) => {
        const specVal = (p.specs as Record<string, string>)?.[specKey]?.toLowerCase() ?? '';
        return values.some((v) => specVal.includes(v));
      });
    }

    return paginate(filtered, page, size);
  }

  return notFound();
}

// ── BRANDS ───────────────────────────────────────────────────────────────────

function handleBrands() {
  const brands = [
    ...new Map(
      PRODUCTS
        .filter((p) => p.brandId && p.brandName)
        .map((p) => [p.brandId, { id: p.brandId, name: p.brandName, slug: p.brandId?.replace('brand-', '') }]),
    ).values(),
  ];
  return ok(brands);
}

// ── BACKEND PROXY ─────────────────────────────────────────────────────────────

const SERVICE_BASES: Record<string, string> = {
  // order-service (8084)
  orders:   'http://localhost:8084',
  checkout: 'http://localhost:8084',
  returns:  'http://localhost:8084',
  admin:    'http://localhost:8084',   // /api/v1/admin/orders — order admin endpoints
  // payment-service (8086)
  payments: 'http://localhost:8086',
  // shipping-service (8091)
  shipping: 'http://localhost:8091',
};

// Hop-by-hop headers that must not be forwarded to upstream
const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailers', 'transfer-encoding', 'upgrade', 'host',
]);

/** Decode the `sub` claim from a Bearer JWT without verifying the signature. */
function decodeJwtSub(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (padded.length % 4)) % 4;
    const json = atob(padded + '='.repeat(padLen));
    const obj = JSON.parse(json) as { sub?: string };
    return obj.sub ?? null;
  } catch {
    return null;
  }
}

async function proxyToBackend(
  request: Request,
  upstreamBase: string,
  segments: string[],
  searchString: string,
): Promise<Response> {
  const upstreamUrl = `${upstreamBase}/api/v1/${segments.join('/')}${searchString}`;

  // Forward headers, skipping hop-by-hop ones
  const forwardHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  });

  // Extract user UUID from JWT sub and inject as X-User-Id (simulates Kong behaviour)
  const authHeader = request.headers.get('authorization');
  const userId = decodeJwtSub(authHeader);
  if (userId) {
    forwardHeaders['X-User-Id'] = userId;
  }

  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(request.method);
  const body = hasBody ? await request.text() : undefined;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream service unavailable';
    return new Response(
      JSON.stringify({ code: 503, message }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function handleRequest(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const [base, ...sub] = path;

  if (base === 'products') return handleProducts(sub, url);
  if (base === 'categories') return handleCategories(sub);
  if (base === 'brands') return handleBrands();
  if (base === 'build-pc') return handleBuildPc(sub, url);

  // Proxy order-service, payment-service, shipping-service
  const upstreamBase = SERVICE_BASES[base];
  if (upstreamBase) {
    return proxyToBackend(request, upstreamBase, path, url.search);
  }

  return ok({});
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
