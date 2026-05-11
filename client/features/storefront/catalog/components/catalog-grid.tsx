import { ProductCard } from '@/features/products/components/product-card';
import type { ProductSummary } from '@/features/products/types';

type CatalogGridProps = {
  items: ProductSummary[];
};

export function CatalogGrid({ items }: CatalogGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
