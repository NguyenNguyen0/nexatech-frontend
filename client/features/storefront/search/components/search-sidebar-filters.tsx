import { CatalogFiltersForm } from '@/features/products/components/catalog-filters-form';
import type { ProductBrand, ProductCategory } from '@/features/products/types';

type SearchSidebarFiltersProps = {
  categories: ProductCategory[];
  brands: ProductBrand[];
  current: {
    keyword?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    maxRating?: string;
    sort?: string;
    featured?: string;
    size?: string;
  };
};

export function SearchSidebarFilters({ categories, brands, current }: SearchSidebarFiltersProps) {
  return (
    <CatalogFiltersForm
      action="/search"
      categories={categories}
      brands={brands}
      current={current}
      showKeyword
    />
  );
}
