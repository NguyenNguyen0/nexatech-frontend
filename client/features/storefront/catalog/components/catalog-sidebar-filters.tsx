import { CatalogFiltersForm } from '@/features/products/components/catalog-filters-form';
import type { ProductBrand, ProductCategory } from '@/features/products/types';

type CatalogSidebarFiltersProps = {
  categories: ProductCategory[];
  brands: ProductBrand[];
  basePath?: string;
  current: {
    categorySlug?: string;
    subcategorySlug?: string;
    brandSlug?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    maxRating?: string;
    sort?: string;
    featured?: string;
    size?: string;
  };
};

export function CatalogSidebarFilters({ categories, brands, current, basePath = '/product' }: CatalogSidebarFiltersProps) {
  return <CatalogFiltersForm action={basePath} categories={categories} brands={brands} current={current} />;
}
