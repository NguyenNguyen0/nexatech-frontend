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

const PRODUCTS = PRODUCTS_RAW.map(normalizeProduct);

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

  return ok({});
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
