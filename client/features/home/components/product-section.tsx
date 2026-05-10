import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/products/components/product-card';
import type { ProductSummary } from '@/features/products/types';

interface ProductSectionProps {
  products: ProductSummary[];
}

export function ProductSection({ products }: ProductSectionProps) {
  const featured = products.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Featured</p>
          <h2 className="mt-2 font-display text-3xl font-black text-text-primary">Sản phẩm nổi bật</h2>
          <p className="mt-2 text-sm text-text-secondary">Lựa chọn đang được quan tâm nhiều nhất từ API mới.</p>
        </div>

        <Link
          href="/product?featured=true"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          Xem tất cả <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {featured.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-border bg-bg-elevated px-6 py-12 text-center text-sm text-text-secondary">
          Chưa có dữ liệu sản phẩm nổi bật.
        </div>
      )}
    </section>
  );
}
