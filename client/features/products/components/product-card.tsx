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
    <Link href={`/product/${product.slug}`} className={cn('block h-full', className)}>
      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full">
        {/* Image */}
        <div className="relative w-full aspect-square bg-surface-container border-b border-outline-variant overflow-hidden">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-[48px]">inventory_2</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount ? (
              <span className="bg-error text-on-error text-[10px] font-bold px-2 py-1 rounded">
                -{discount}%
              </span>
            ) : null}
            {product.stockStatus ? (
              <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded">
                {getStockStatusLabel(product.stockStatus)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className={cn('p-4 flex flex-col flex-grow', variant === 'compact' && 'p-3')}>
          <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            {product.brandName ?? product.primaryCategoryName ?? product.categoryName ?? 'NexaTech'}
          </div>
          <h3 className={cn('text-label-sm font-label-sm text-on-surface font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors', variant === 'compact' && 'text-[12px] leading-tight')}>
            {product.name}
          </h3>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-body-md font-bold text-primary', variant === 'compact' && 'text-label-sm')}>
                {formatCurrency(product.price)}
              </span>
              {typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price ? (
                <span className="text-[11px] text-on-surface-variant line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-medium">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
                <span>({product.reviewCount ?? 0})</span>
              </div>
              <span>{typeof product.stockQuantity === 'number' ? `${product.stockQuantity} kho` : 'Còn hàng'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
