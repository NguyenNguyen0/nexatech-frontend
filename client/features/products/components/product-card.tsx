/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { ProductSummary } from '../types';
import { getStockStatusClassName, getStockStatusLabel } from '../utils';

interface ProductCardProps {
  product: ProductSummary;
  variant?: 'grid' | 'compact';
  className?: string;
}

export function ProductCard({ product, variant = 'grid', className }: ProductCardProps) {
  const discount =
    typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;
  const rating = typeof product.averageRating === 'number' ? product.averageRating : 0;

  return (
    <Link href={`/product/${product.slug}`} className={cn('group block h-full', className)}>
      <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-bg-elevated shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
        <div className={cn('relative overflow-hidden bg-bg-sunken', variant === 'compact' ? 'aspect-square' : 'aspect-[4/3]')}>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent text-5xl font-black text-primary/70">
              NT
            </div>
          )}

          <div className="absolute left-3 top-3 flex gap-2">
            {discount ? (
              <span className="rounded-full bg-danger px-3 py-1 text-xs font-bold text-white">
                -{discount}%
              </span>
            ) : null}
            {product.stockStatus ? (
              <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', getStockStatusClassName(product.stockStatus))}>
                {getStockStatusLabel(product.stockStatus)}
              </span>
            ) : null}
          </div>
        </div>

        <div className={cn('flex flex-1 flex-col gap-3 p-4', variant === 'compact' && 'p-3')}>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
              {product.brandName ?? product.categoryName ?? 'NexaTech'}
            </p>
            <h3 className={cn('font-display text-base font-bold leading-snug text-text-primary line-clamp-2', variant === 'compact' && 'text-sm')}>
              {product.name}
            </h3>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <div className={cn('text-xl font-black text-primary', variant === 'compact' && 'text-lg')}>
                {formatCurrency(product.price)}
              </div>
              {typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price ? (
                <div className="text-xs text-text-tertiary line-through">
                  {formatCurrency(product.compareAtPrice)}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning-dark">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {rating > 0 ? rating.toFixed(1) : '0.0'}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-text-tertiary">
            <span>{product.reviewCount ?? 0} đánh giá</span>
            <span>{typeof product.stockQuantity === 'number' ? `${product.stockQuantity} còn lại` : 'Theo kho'}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
