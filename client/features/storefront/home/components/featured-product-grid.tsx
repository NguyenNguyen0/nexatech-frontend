import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { fetchFeaturedProducts } from '@/features/products/services/products-api';
import { ProductCard } from '@/features/products/components/product-card';
import type { ProductMinimal } from '@/features/products/types';

export async function FeaturedProductGrid() {
  const featuredProducts = await fetchFeaturedProducts({ size: 8, page: 0, sort: 'createdAt,desc' }).catch(
    () => ({ items: [] as ProductMinimal[] }),
  );

  return (
    <section className="mx-auto w-full max-w-container-max px-4 py-5">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-bold text-[#1b1c1c]">Sản phẩm nổi bật</h2>
        <Link
          href="/product?featured=true"
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-storefront-primary transition hover:underline"
        >
          Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {featuredProducts.items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.items.map((product) => (
            <ProductCard key={product.id} product={product} variant="compact" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[#e8e8e8] bg-white px-4 py-8 text-sm text-[#666]">
          Chưa có sản phẩm nổi bật để hiển thị.
        </div>
      )}
    </section>
  );
}
