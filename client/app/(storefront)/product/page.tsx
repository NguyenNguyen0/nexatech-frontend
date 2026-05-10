import type { Metadata } from 'next';
import Link from 'next/link';
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Catalog</p>
        <h1 className="font-display text-4xl font-black text-text-primary">Sản phẩm</h1>
        <p className="max-w-2xl text-sm text-text-secondary">
          Kết quả được lấy trực tiếp từ API catalog mới, hỗ trợ lọc theo danh mục, thương hiệu, giá và đánh giá.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <CatalogFiltersForm
          action="/product"
          categories={categories}
          brands={brands}
          current={current}
        />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-bg-elevated px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">{`${totalItems.toLocaleString('vi-VN')} sản phẩm`}</p>
              <p className="text-xs text-text-tertiary">
                Trang {productsPage.page} / {totalPages}
                {current.featured ? ` • ${current.featured === 'true' ? 'Chỉ nổi bật' : 'Loại bỏ nổi bật'}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span>Sắp xếp:</span>
              <strong className="text-text-primary">{current.sort ?? 'createdAt,desc'}</strong>
            </div>
          </div>

          {productsPage.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {productsPage.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-bg-elevated px-5 py-4">
                <p className="text-sm text-text-secondary">
                  Hiển thị {productsPage.items.length} / {totalItems.toLocaleString('vi-VN')} sản phẩm
                </p>

                <div className="flex items-center gap-2">
                  {hasPrevious ? (
                    <Link
                      href={`/product?${buildQuery(resolvedSearchParams, { page: String(productsPage.page - 1) })}`}
                      className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-bg-base px-4 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
                    >
                      Trang trước
                    </Link>
                  ) : null}

                  {hasNext ? (
                    <Link
                      href={`/product?${buildQuery(resolvedSearchParams, { page: String(productsPage.page + 1) })}`}
                      className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                      Trang sau
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-bg-elevated px-6 py-14 text-center">
              <p className="text-lg font-semibold text-text-primary">Không tìm thấy sản phẩm phù hợp</p>
              <p className="mt-2 text-sm text-text-secondary">Thử giảm bộ lọc hoặc thay đổi từ khóa tìm kiếm.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
