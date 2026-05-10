import Link from 'next/link';
import { ProductCard } from '@/features/products/components/product-card';
import type { ProductSummary } from '@/features/products/types';

type PdpRelatedProductsProps = {
  products: ProductSummary[];
};

export function PdpRelatedProducts({ products }: PdpRelatedProductsProps) {
  return (
    <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Related</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-text-primary">Sản phẩm liên quan</h2>
        </div>
        <Link href="/product" className="text-sm font-semibold text-primary transition hover:text-primary-dark">
          Xem catalog
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-bg-base px-6 py-10 text-center text-sm text-text-secondary">
          Chưa có sản phẩm liên quan để hiển thị.
        </div>
      )}
    </section>
  );
}
