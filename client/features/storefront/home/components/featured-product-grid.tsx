import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import { fetchFeaturedProducts } from '@/features/products/services/products-api';
import type { ProductMinimal } from '@/features/products/types';

type ProductCardData = ProductMinimal;

function formatVND(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-2.5 w-2.5 ${
              star <= Math.floor(rating)
                ? 'fill-[#f5a623] text-[#f5a623]'
                : star <= rating
                  ? 'fill-[#f5a623]/50 text-[#f5a623]'
                  : 'fill-[#ddd] text-[#ddd]'
            }`}
          />
        ))}
      </div>
      {reviewCount > 0 && (
        <span className="text-[10px] text-[#999]">({reviewCount})</span>
      )}
    </div>
  );
}

function BadgePill({ label, variant }: { label: string; variant: 'hot' | 'new' }) {
  const colors =
    variant === 'hot'
      ? 'bg-[#e30019] text-white'
      : 'bg-[#0a8a50] text-white';

  return (
    <span className={`rounded-sm px-1.5 py-px text-[9px] font-bold uppercase ${colors}`}>
      {label}
    </span>
  );
}

function ProductCard({ product }: { product: ProductCardData }) {
  const badges = product.tags?.length ? product.tags : ['hot', 'new'];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-md border border-[#e8e8e8] bg-white transition-all duration-150 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative bg-[#f7f7f7] p-2.5">
        <div className="absolute left-1.5 top-1.5 z-10 flex gap-0.5">
          {badges.map((badge) => (
            <BadgePill
              key={badge}
              label={badge.charAt(0).toUpperCase() + badge.slice(1)}
              variant={badge.toLowerCase() === 'hot' ? 'hot' : 'new'}
            />
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnail ?? ''}
          alt={product.name}
          className="mx-auto aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-[12px] font-medium leading-[1.4] text-[#333] line-clamp-2">
          {product.name}
        </p>
        <div className="mt-1">
          <RatingStars rating={product.averageRating ?? 0} reviewCount={product.reviewCount ?? 0} />
        </div>
        <p className="mt-1.5 text-[13px] font-bold text-[#e30019]">{formatVND(product.price)}</p>
      </div>
    </Link>
  );
}

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
            <ProductCard key={product.id} product={product} />
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
