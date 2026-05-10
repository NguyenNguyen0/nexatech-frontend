import Link from 'next/link';
import { Heart, ShieldCheck, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type PdpSummaryProps = {
  name: string;
  slug: string;
  categoryName?: string;
  brandName?: string;
  price: number;
  compareAtPrice?: number;
  averageRating?: number;
  stockStatus?: string;
  stockQuantity?: number;
};

export function PdpSummary({
  name,
  slug,
  categoryName,
  brandName,
  price,
  compareAtPrice,
  averageRating,
  stockStatus,
  stockQuantity,
}: PdpSummaryProps) {
  return (
    <div className="space-y-6 rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      {/* Meta + heading */}
      <div className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
          {categoryName && <span>{categoryName}</span>}
          {categoryName && brandName && <span aria-hidden="true">•</span>}
          {brandName && <span>{brandName}</span>}
        </div>

        <h1 className="font-display text-3xl font-black text-text-primary">{name}</h1>

        {/* Price + rating row */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="text-3xl font-black text-primary">{formatCurrency(price)}</div>
            {typeof compareAtPrice === 'number' && compareAtPrice > price && (
              <div className="text-sm text-text-tertiary line-through">{formatCurrency(compareAtPrice)}</div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2 text-sm font-semibold text-warning-dark">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {typeof averageRating === 'number' ? averageRating.toFixed(1) : '0.0'}
          </div>

          {stockStatus && (
            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              {stockStatus}
            </div>
          )}
        </div>

        {/* Stock + trust badges */}
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2 rounded-full bg-bg-base px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            {typeof stockQuantity === 'number' ? `${stockQuantity} sản phẩm còn lại` : 'Tồn kho theo thời gian thực'}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-bg-base px-3 py-2">
            <Heart className="h-4 w-4 text-danger" />
            Ưu đãi, mô tả và ảnh được lấy từ API mới
          </span>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/product"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-bg-base px-5 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
        >
          Xem thêm sản phẩm
        </Link>
        <Link
          href={`/search?keyword=${encodeURIComponent(name)}`}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Tìm tương tự
        </Link>
      </div>
    </div>
  );
}
