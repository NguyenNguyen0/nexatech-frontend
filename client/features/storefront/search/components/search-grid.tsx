import { ProductCard } from '@/features/products/components/product-card';
import type { ProductSummary } from '@/features/products/types';

type SearchGridProps = {
  items: ProductSummary[];
};

export function SearchGrid({ items }: SearchGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
