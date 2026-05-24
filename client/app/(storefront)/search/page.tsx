import type { Metadata } from 'next';
import {
  SearchHeader,
  SearchResultSummary,
  SearchGrid,
  SearchPagination,
  SearchEmptyState,
  SearchSidebarFilters,
} from '@/features/storefront/search/components';
import { fetchBrands, fetchCategories, fetchSubcategories, searchProducts } from '@/features/products/services/products-api';
import type { PageResult, ProductMinimal } from '@/features/products/types';
import { toNumberParam, toStringParam } from '@/features/products/utils';

export const metadata: Metadata = {
  title: 'Tìm kiếm sản phẩm',
  description: 'Tìm kiếm sản phẩm theo từ khóa và bộ lọc catalog.',
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SearchPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const keyword = toStringParam(resolvedSearchParams.keyword);
  const requestedPage = Math.max(1, toNumberParam(resolvedSearchParams.page, 1) ?? 1);
  const apiPage = requestedPage - 1;

  const categorySlug = toStringParam(resolvedSearchParams.categorySlug) ?? toStringParam(resolvedSearchParams.categoryId);
  const brandSlug = toStringParam(resolvedSearchParams.brandSlug) ?? toStringParam(resolvedSearchParams.brandId);
  const subcategorySlug = toStringParam(resolvedSearchParams.subcategorySlug) ?? toStringParam(resolvedSearchParams.subcategoryId);

  const current = {
    keyword,
    categorySlug,
    subcategorySlug,
    brandSlug,
    minPrice: toStringParam(resolvedSearchParams.minPrice),
    maxPrice: toStringParam(resolvedSearchParams.maxPrice),
    minRating: toStringParam(resolvedSearchParams.minRating),
    maxRating: toStringParam(resolvedSearchParams.maxRating),
    sort: toStringParam(resolvedSearchParams.sort) ?? 'relevance,desc',
    featured: toStringParam(resolvedSearchParams.featured),
    size: toStringParam(resolvedSearchParams.size) ?? '12',
  };

  const [categories, brands] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchBrands().catch(() => []),
  ]);

  const categoryId = current.categorySlug
    ? categories.find((category) => category.slug === current.categorySlug || category.id === current.categorySlug)?.id
    : undefined;
  const brandId = current.brandSlug
    ? brands.find((brand) => brand.slug === current.brandSlug || brand.id === current.brandSlug)?.id
    : undefined;

  let subcategoryId: string | undefined;
  if (categoryId && current.subcategorySlug) {
    const subcategories = await fetchSubcategories(current.categorySlug ?? categoryId).catch(() => []);
    subcategoryId = subcategories.find((subcategory) => subcategory.slug === current.subcategorySlug || subcategory.id === current.subcategorySlug)?.id;
  }

  const resultsPage = keyword
    ? await searchProducts(keyword, {
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
        () => ({ items: [], page: 1, size: 12, totalItems: 0, totalPages: 1, hasNext: false } as PageResult<ProductMinimal>),
      )
    : ({ items: [], page: 1, size: 12, totalItems: 0, totalPages: 1, hasNext: false } as PageResult<ProductMinimal>);

  const totalItems = resultsPage.totalItems ?? resultsPage.items.length;
  const totalPages = resultsPage.totalPages ?? (resultsPage.size > 0 ? Math.max(1, Math.ceil(totalItems / resultsPage.size)) : 1);
  const currentPage = Math.min(totalPages, Math.max(1, (resultsPage.page ?? apiPage) + 1));
  const hasPrevious = currentPage > 1;
  const hasNext = resultsPage.hasNext ?? currentPage < totalPages;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SearchHeader keyword={keyword} />

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SearchSidebarFilters categories={categories} brands={brands} current={current} />

        <div className="space-y-6">
          <SearchResultSummary
            keyword={keyword}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          {keyword && resultsPage.items.length > 0 ? (
            <>
              <SearchGrid items={resultsPage.items} />
              <SearchPagination
                currentPage={currentPage}
                totalItems={totalItems}
                totalPages={totalPages}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                displayCount={resultsPage.items.length}
                searchParams={resolvedSearchParams}
              />
            </>
          ) : keyword ? (
            <SearchEmptyState variant="no-results" />
          ) : (
            <SearchEmptyState variant="no-keyword" />
          )}
        </div>
      </div>
    </section>
  );
}
