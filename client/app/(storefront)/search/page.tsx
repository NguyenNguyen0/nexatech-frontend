import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/features/products/components/product-card';
import { CatalogFiltersForm } from '@/features/products/components/catalog-filters-form';
import { fetchBrands, fetchCategories, searchProducts } from '@/features/products/services/products-api';
import type { PageResult, ProductSummary } from '@/features/products/types';
import { toNumberParam, toStringParam } from '@/features/products/utils';

export const metadata: Metadata = {
  title: 'Tìm kiếm sản phẩm',
  description: 'Tìm kiếm sản phẩm theo từ khóa và bộ lọc catalog.',
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

export default async function SearchPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const keyword = toStringParam(resolvedSearchParams.keyword);
  const page = toNumberParam(resolvedSearchParams.page, 1) ?? 1;

  const current = {
    keyword,
    categoryId: toStringParam(resolvedSearchParams.categoryId),
    brandId: toStringParam(resolvedSearchParams.brandId),
    minPrice: toStringParam(resolvedSearchParams.minPrice),
    maxPrice: toStringParam(resolvedSearchParams.maxPrice),
    minRating: toStringParam(resolvedSearchParams.minRating),
    maxRating: toStringParam(resolvedSearchParams.maxRating),
    sort: toStringParam(resolvedSearchParams.sort) ?? 'relevance,desc',
    featured: toStringParam(resolvedSearchParams.featured),
    size: toStringParam(resolvedSearchParams.size) ?? '12',
  };

  const [resultsPage, categories, brands] = await Promise.all([
    keyword
      ? searchProducts(keyword, {
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
        )
      : Promise.resolve({ items: [], page: 1, size: 12, totalItems: 0, totalPages: 1, hasNext: false } as PageResult<ProductSummary>),
    fetchCategories().catch(() => []),
    fetchBrands().catch(() => []),
  ]);

  const totalItems = resultsPage.totalItems ?? resultsPage.items.length;
  const totalPages = resultsPage.totalPages ?? (resultsPage.size > 0 ? Math.max(1, Math.ceil(totalItems / resultsPage.size)) : 1);
  const hasPrevious = resultsPage.page > 1;
  const hasNext = resultsPage.hasNext ?? resultsPage.page < totalPages;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8">
      <div className="mb-8 rounded-[2rem] border border-border bg-[image:var(--gradient-brand)] px-6 py-8 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Search</p>
        <h1 className="mt-2 font-display text-4xl font-black">{keyword ? `Kết quả cho “${keyword}”` : 'Tìm kiếm sản phẩm'}</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/85">
          Gợi ý nhanh và kết quả đầy đủ đều dùng API search mới. Bạn có thể refine thêm bằng bộ lọc bên dưới.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <CatalogFiltersForm
          action="/search"
          categories={categories}
          brands={brands}
          current={current}
          showKeyword
        />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border bg-bg-elevated px-5 py-4">
            <p className="text-sm font-semibold text-text-primary">
              {keyword ? `${totalItems.toLocaleString('vi-VN')} kết quả` : 'Nhập từ khóa để tìm kiếm'}
            </p>
            <p className="text-xs text-text-tertiary">
              Trang {resultsPage.page} / {totalPages}
            </p>
          </div>

          {keyword && resultsPage.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {resultsPage.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border bg-bg-elevated px-5 py-4">
                <p className="text-sm text-text-secondary">
                  Hiển thị {resultsPage.items.length} / {totalItems.toLocaleString('vi-VN')} sản phẩm
                </p>

                <div className="flex items-center gap-2">
                  {hasPrevious ? (
                    <Link
                      href={`/search?${buildQuery(resolvedSearchParams, { page: String(resultsPage.page - 1) })}`}
                      className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-bg-base px-4 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
                    >
                      Trang trước
                    </Link>
                  ) : null}

                  {hasNext ? (
                    <Link
                      href={`/search?${buildQuery(resolvedSearchParams, { page: String(resultsPage.page + 1) })}`}
                      className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                      Trang sau
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          ) : keyword ? (
            <div className="rounded-[1.75rem] border border-dashed border-border bg-bg-elevated px-6 py-14 text-center">
              <p className="text-lg font-semibold text-text-primary">Không có sản phẩm phù hợp</p>
              <p className="mt-2 text-sm text-text-secondary">Hãy thử từ khóa khác hoặc nới lỏng bộ lọc.</p>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-border bg-bg-elevated px-6 py-14 text-center text-sm text-text-secondary">
              Sử dụng thanh tìm kiếm trên header để bắt đầu.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
