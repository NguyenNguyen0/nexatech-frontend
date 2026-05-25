import Link from 'next/link';
import { ProductCard } from '@/features/products/components/product-card';
import type { ProductMinimal } from '@/features/products/types';

type PdpRelatedProductsProps = {
  products: ProductMinimal[];
};

export function PdpRelatedProducts({ products }: PdpRelatedProductsProps) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-headline-md font-headline-md text-on-surface">Sản phẩm liên quan</h2>
        </div>
        <Link href="/product" className="text-label-lg font-bold text-primary hover:underline transition-all">
          Xem tất cả
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-outline-variant bg-surface px-6 py-10 text-center text-body-md text-on-surface-variant">
          Chưa có sản phẩm liên quan để hiển thị.
        </div>
      )}
    </section>
  );
}
