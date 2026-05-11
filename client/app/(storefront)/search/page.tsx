import type { Metadata } from 'next';
import {
  SearchHeader,
  SearchResultSummary,
  SearchGrid,
  SearchPagination,
  SearchEmptyState,
  SearchSidebarFilters,
} from '@/features/storefront/search/components';
import { fetchBrands, fetchCategories, searchProducts } from '@/features/products/services/products-api';
import type { PageResult, ProductSummary } from '@/features/products/types';
import { toNumberParam, toStringParam } from '@/features/products/utils';

export const metadata: Metadata = {
  title: 'Tìm kiếm sản phẩm',
  description: 'Tìm kiếm sản phẩm theo từ khóa và bộ lọc catalog.',
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SearchPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const keyword = toStringParam(resolvedSearchParams.keyword);
  const page = toNumberParam(resolvedSearchParams.page, 1) ?? 1;

  const current = {
    keyword,
    categoryId: toStringParam(resolvedSearchParams.categoryId),
    subcategoryId: toStringParam(resolvedSearchParams.subcategoryId),
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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SearchHeader keyword={keyword} />

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SearchSidebarFilters categories={categories} brands={brands} current={current} />

        <div className="space-y-6">
          <SearchResultSummary
            keyword={keyword}
            totalItems={totalItems}
            currentPage={resultsPage.page}
            totalPages={totalPages}
          />

          {keyword && resultsPage.items.length > 0 ? (
            <>
              <SearchGrid items={resultsPage.items} />
              <SearchPagination
                currentPage={resultsPage.page}
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

