import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/products/components/product-card';
import { CatalogFiltersForm } from '@/features/products/components/catalog-filters-form';
import { fetchBrands, fetchCategories, fetchProducts } from '@/features/products/services/products-api';
import type { PageResult, ProductSummary } from '@/features/products/types';
import { toNumberParam, toStringParam } from '@/features/products/utils';

export const metadata: Metadata = {
  title: 'Sản phẩm',
  description: 'Danh sách sản phẩm, bộ lọc và sắp xếp theo API mới.',
};

type SearchParams = Record<string, string | string[] | undefined>;

function buildQuery(current: SearchParams, updates: Record<string, string | undefined>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized !== undefined && normalized !== '') {
      params.set(key, normalized);
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === '') params.delete(key);
    else params.set(key, value);
  }

  return params.toString();
}

/** Generates page numbers with ellipsis for pagination */
function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default async function ProductPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const current = {
    categoryId: toStringParam(resolvedSearchParams.categoryId),
    brandId: toStringParam(resolvedSearchParams.brandId),
    minPrice: toStringParam(resolvedSearchParams.minPrice),
    maxPrice: toStringParam(resolvedSearchParams.maxPrice),
    minRating: toStringParam(resolvedSearchParams.minRating),
    maxRating: toStringParam(resolvedSearchParams.maxRating),
    sort: toStringParam(resolvedSearchParams.sort),
    featured: toStringParam(resolvedSearchParams.featured),
    size: toStringParam(resolvedSearchParams.size) ?? '12',
  };

  const page = toNumberParam(resolvedSearchParams.page, 1) ?? 1;

  const [productsPage, categories, brands] = await Promise.all([
    fetchProducts({
      page,
      size: Number(current.size) || 12,
      sort: current.sort,
      categoryId: current.categoryId,
      brandId: current.brandId,
      minPrice: toNumberParam(resolvedSearchParams.minPrice),
      maxPrice: toNumberParam(resolvedSearchParams.maxPrice),
      minRating: toNumberParam(resolvedSearchParams.minRating),
      maxRating: toNumberParam(resolvedSearchParams.maxRating),
      featured: current.featured === 'true' ? true : current.featured === 'false' ? false : undefined,
    }).catch(
      () => ({ items: [], page: 1, size: 12, totalItems: 0, totalPages: 1, hasNext: false } as PageResult<ProductSummary>),
    ),
    fetchCategories().catch(() => []),
    fetchBrands().catch(() => []),
  ]);

  const totalItems = productsPage.totalItems ?? productsPage.items.length;
  const totalPages = productsPage.totalPages ?? (productsPage.size > 0 ? Math.max(1, Math.ceil(totalItems / productsPage.size)) : 1);
  const hasPrevious = productsPage.page > 1;
  const hasNext = productsPage.hasNext ?? productsPage.page < totalPages;

  const activeCategory = current.categoryId ? categories.find((c) => c.id === current.categoryId) : undefined;
  const activeBrand = current.brandId ? brands.find((b) => b.id === current.brandId) : undefined;

  const pageTitle = activeCategory?.name ?? activeBrand?.name ?? 'Sản phẩm';
  const pageDescription =
    activeCategory?.description ??
    (activeBrand
      ? `Danh sách sản phẩm thương hiệu ${activeBrand.name}.`
      : 'Khám phá bộ sưu tập sản phẩm công nghệ chính hãng, được tuyển chọn kỹ lưỡng cho mọi nhu cầu.');

  const pageRange = getPageRange(productsPage.page, totalPages);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-text-secondary">
        <Link href="/" className="transition-colors hover:text-primary">
          Trang chủ
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
        {activeCategory || activeBrand ? (
          <>
            <Link href="/product" className="transition-colors hover:text-primary">
              Sản phẩm
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="font-semibold text-primary">{pageTitle}</span>
          </>
        ) : (
          <span className="font-semibold text-primary">Sản phẩm</span>
        )}
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Catalog</p>
        <h1 className="font-display text-4xl font-black text-text-primary">{pageTitle}</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">{pageDescription}</p>
      </div>

      {/* Layout: sidebar + main */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <CatalogFiltersForm
          action="/product"
          categories={categories}
          brands={brands}
          current={current}
        />

        <div className="min-w-0 flex-1 space-y-6">
          {/* Count + sort summary */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">
              Hiển thị{' '}
              <span className="font-bold text-text-primary">{totalItems.toLocaleString('vi-VN')}</span>{' '}
              sản phẩm
            </p>
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <span>Sắp xếp:</span>
              <span className="font-semibold text-primary">
                {current.sort === 'price,asc'
                  ? 'Giá tăng dần'
                  : current.sort === 'price,desc'
                    ? 'Giá giảm dần'
                    : current.sort === 'averageRating,desc'
                      ? 'Đánh giá cao'
                      : current.sort === 'relevance,desc'
                        ? 'Phù hợp nhất'
                        : 'Mới nhất'}
              </span>
            </div>
          </div>

          {productsPage.items.length > 0 ? (
            <>
              {/* Product grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {productsPage.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Numbered pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <nav className="flex items-center gap-1.5" aria-label="Phân trang">
                    {/* Prev */}
                    {hasPrevious ? (
                      <Link
                        href={`/product?${buildQuery(resolvedSearchParams, { page: String(productsPage.page - 1) })}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-secondary transition hover:border-primary hover:text-primary"
                        aria-label="Trang trước"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </Link>
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-tertiary opacity-40">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </span>
                    )}

                    {/* Page numbers */}
                    {pageRange.map((p, idx) =>
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="flex h-10 w-10 items-center justify-center text-sm text-text-tertiary">
                          …
                        </span>
                      ) : p === productsPage.page ? (
                        <span
                          key={p}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
                          aria-current="page"
                        >
                          {p}
                        </span>
                      ) : (
                        <Link
                          key={p}
                          href={`/product?${buildQuery(resolvedSearchParams, { page: String(p) })}`}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-sm text-text-secondary transition hover:border-primary hover:text-primary"
                        >
                          {p}
                        </Link>
                      ),
                    )}

                    {/* Next */}
                    {hasNext ? (
                      <Link
                        href={`/product?${buildQuery(resolvedSearchParams, { page: String(productsPage.page + 1) })}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-secondary transition hover:border-primary hover:text-primary"
                        aria-label="Trang sau"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-tertiary opacity-40">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-bg-elevated px-6 py-16 text-center">
              <p className="text-lg font-semibold text-text-primary">Không tìm thấy sản phẩm phù hợp</p>
              <p className="mt-2 text-sm text-text-secondary">Thử giảm bộ lọc hoặc thay đổi từ khóa tìm kiếm.</p>
              <Link
                href="/product"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-border bg-bg-base px-4 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
              >
                Xóa tất cả bộ lọc
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
