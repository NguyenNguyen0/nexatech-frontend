import type { Metadata } from 'next';
import { StorefrontEmptyState } from '@/features/storefront/shared/components/storefront-empty-state';
import {
  CatalogGrid,
  CatalogPageHeader,
  CatalogPagination,
  CatalogSidebarFilters,
  CatalogToolbar,
} from '@/features/storefront/catalog/components';
import { fetchBrands, fetchCategories, fetchProducts, fetchSubcategories } from '@/features/products/services/products-api';
import type { PageResult, ProductSummary } from '@/features/products/types';
import { toNumberParam, toStringParam } from '@/features/products/utils';

export const metadata: Metadata = {
  title: 'Sản phẩm',
  description: 'Danh sách sản phẩm, bộ lọc và sắp xếp theo API mới.',
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const categorySlug = toStringParam(resolvedSearchParams.categorySlug) ?? toStringParam(resolvedSearchParams.categoryId);
  const brandSlug = toStringParam(resolvedSearchParams.brandSlug) ?? toStringParam(resolvedSearchParams.brandId);
  const subcategorySlug = toStringParam(resolvedSearchParams.subcategorySlug) ?? toStringParam(resolvedSearchParams.subcategoryId);

  const current = {
    categorySlug,
    subcategorySlug,
    brandSlug,
    minPrice: toStringParam(resolvedSearchParams.minPrice),
    maxPrice: toStringParam(resolvedSearchParams.maxPrice),
    minRating: toStringParam(resolvedSearchParams.minRating),
    maxRating: toStringParam(resolvedSearchParams.maxRating),
    sort: toStringParam(resolvedSearchParams.sort),
    featured: toStringParam(resolvedSearchParams.featured),
    size: toStringParam(resolvedSearchParams.size) ?? '12',
  };

  const requestedPage = Math.max(1, toNumberParam(resolvedSearchParams.page, 1) ?? 1);
  const apiPage = requestedPage - 1;

  const [categories, brands] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchBrands().catch(() => []),
  ]);

  const activeCategory = current.categorySlug
    ? categories.find((category) => category.slug === current.categorySlug || category.id === current.categorySlug)
    : undefined;
  const activeBrand = current.brandSlug
    ? brands.find((brand) => brand.slug === current.brandSlug || brand.id === current.brandSlug)
    : undefined;

  const categoryId = activeCategory?.id;
  const brandId = activeBrand?.id;

  let subcategoryId: string | undefined;
  if (categoryId && current.subcategorySlug) {
    const subcategories = await fetchSubcategories(current.categorySlug ?? categoryId).catch(() => []);
    subcategoryId = subcategories.find((subcategory) => subcategory.slug === current.subcategorySlug || subcategory.id === current.subcategorySlug)?.id;
  }

  const productsPage = await fetchProducts({
    page: apiPage,
    size: Number(current.size) || 12,
    sort: current.sort,
    categoryId,
    subcategoryId,
    brandId,
    minPrice: toNumberParam(resolvedSearchParams.minPrice),
    maxPrice: toNumberParam(resolvedSearchParams.maxPrice),
    minRating: toNumberParam(resolvedSearchParams.minRating),
    maxRating: toNumberParam(resolvedSearchParams.maxRating),
    featured: current.featured === 'true' ? true : current.featured === 'false' ? false : undefined,
  }).catch(
    () => ({ items: [], page: 1, size: 12, totalItems: 0, totalPages: 1, hasNext: false } as PageResult<ProductSummary>),
  );

  const totalItems = productsPage.totalItems ?? productsPage.items.length;
  const totalPages = productsPage.totalPages ?? (productsPage.size > 0 ? Math.max(1, Math.ceil(totalItems / productsPage.size)) : 1);
  const currentPage = Math.min(totalPages, Math.max(1, (productsPage.page ?? apiPage) + 1));
  const hasPrevious = currentPage > 1;
  const hasNext = productsPage.hasNext ?? currentPage < totalPages;

  const pageTitle = activeCategory?.name ?? activeBrand?.name ?? 'Sản phẩm';
  const pageDescription =
    activeCategory?.description ??
    (activeBrand
      ? `Danh sách sản phẩm thương hiệu ${activeBrand.name}.`
      : 'Khám phá bộ sưu tập sản phẩm công nghệ chính hãng, được tuyển chọn kỹ lưỡng cho mọi nhu cầu.');

  return (
    <section className="mx-auto max-w-300 px-4 py-8 sm:px-6 lg:px-8">
      <CatalogPageHeader pageTitle={pageTitle} pageDescription={pageDescription} hasContext={Boolean(activeCategory || activeBrand)} />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <CatalogSidebarFilters categories={categories} brands={brands} current={current} />

        <div className="min-w-0 flex-1 space-y-6">
          <CatalogToolbar totalItems={totalItems} sort={current.sort} />

          {productsPage.items.length > 0 ? (
            <>
              <CatalogGrid items={productsPage.items} />
              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                searchParams={resolvedSearchParams}
              />
            </>
          ) : (
            <StorefrontEmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description="Thử giảm bộ lọc hoặc thay đổi từ khóa tìm kiếm."
            />
          )}
        </div>
      </div>
    </section>
  );
}
