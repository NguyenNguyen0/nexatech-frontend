import { CatalogFiltersForm } from '@/features/products/components/catalog-filters-form';
import type { ProductBrand, ProductCategory } from '@/features/products/types';

type CatalogSidebarFiltersProps = {
  categories: ProductCategory[];
  brands: ProductBrand[];
  current: {
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

export function CatalogSidebarFilters({ categories, brands, current }: CatalogSidebarFiltersProps) {
  return <CatalogFiltersForm action="/product" categories={categories} brands={brands} current={current} />;
}
