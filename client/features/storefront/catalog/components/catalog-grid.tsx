import { ProductCard } from '@/features/products/components/product-card';
import type { ProductMinimal } from '@/features/products/types';

type CatalogGridProps = {
  items: ProductMinimal[];
};

export function CatalogGrid({ items }: CatalogGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
