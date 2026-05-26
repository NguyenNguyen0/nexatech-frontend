'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { cn, formatCurrency } from '@/lib/utils';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import type { ProductMinimal } from '../types';
import { getStockStatusLabel } from '../utils';

interface ProductCardProps {
    product: ProductMinimal;
    variant?: 'grid' | 'compact';
    className?: string;
    action?: ReactNode;
    actionLabel?: string;
}

export function ProductCard({ product, variant = 'grid', className, action, actionLabel }: ProductCardProps) {
    const { isWishlisted, isMutating, toggleWishlist } = useWishlist();
    const discount =
        typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price
            ? Math.round((1 - product.price / product.compareAtPrice) * 100)
            : null;
    const rating = typeof product.averageRating === 'number' ? product.averageRating : 0;
    const wishlisted = isWishlisted(product.id);
    const isWishlistUpdating = isMutating(product.id);
    const productHref = `/product/${product.slug}`;

    return (
        <article
            className={cn(
                'group relative flex h-full min-w-0 flex-col overflow-hidden rounded-sm border border-outline-variant bg-surface shadow-sm transition-shadow hover:shadow-md',
                className,
            )}
        >
            <div className="absolute right-2 top-2 z-20">
                {action ?? (
                    <button
                        type="button"
                        disabled={isWishlistUpdating}
                        onClick={async () => {
                            const next = await toggleWishlist(product.id);
                            if (typeof next === 'boolean') {
                                toast.success(next ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
                            }
                        }}
                        title={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                        aria-label={actionLabel ?? (wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích')}
                        className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-sm border bg-white/95 text-on-surface-variant backdrop-blur transition-colors hover:border-error hover:text-error',
                            wishlisted && 'border-error text-error',
                            isWishlistUpdating && 'cursor-not-allowed opacity-60',
                        )}
                    >
                        <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}
                        >
                            favorite
                        </span>
                    </button>
                )}
            </div>

            <Link href={productHref} className="block">
                <div className="relative aspect-square w-full overflow-hidden border-b border-outline-variant bg-surface-container">
                    {product.thumbnail ? (
                        <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline text-[48px]">inventory_2</span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {discount ? (
                            <span className="bg-error text-on-error text-[10px] font-bold px-2 py-1 rounded-sm">
                                -{discount}%
                            </span>
                        ) : null}
                        {product.stockStatus ? (
                            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-sm">
                                {getStockStatusLabel(product.stockStatus)}
                            </span>
                        ) : null}
                    </div>
                </div>
            </Link>

            <div className={cn('flex min-w-0 grow flex-col p-4', variant === 'compact' && 'p-4')}>
                <div className="mb-1 truncate text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <Link href={productHref} className="hover:text-primary">
                        {product.brandName ?? product.primaryCategoryName ?? 'NexaTech'}
                    </Link>
                </div>
                <Link href={productHref} className="mb-2 block min-h-[2.5rem] text-on-surface transition-colors hover:text-primary">
                    <h3 className="line-clamp-2 overflow-hidden break-words text-label-sm font-medium leading-5">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto min-w-0">
                    <div className="mb-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="min-w-0 truncate text-body-md font-bold text-primary">
                            {formatCurrency(product.price)}
                        </span>
                        {typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price ? (
                            <span className="min-w-0 truncate text-[11px] text-on-surface-variant line-through">
                                {formatCurrency(product.compareAtPrice)}
                            </span>
                        ) : null}
                    </div>

                    <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] text-on-surface-variant">
                        <div className="flex min-w-0 items-center gap-1">
                            <span
                                className="material-symbols-outlined shrink-0 text-[14px] text-secondary"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                star
                            </span>
                            <span className="shrink-0 font-medium">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
                            <span className="min-w-0 truncate">({product.reviewCount ?? 0})</span>
                        </div>
                        <span className="min-w-0 shrink truncate text-right">
                            {typeof product.stockQuantity === 'number' ? `${product.stockQuantity} kho` : 'Còn hàng'}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}
