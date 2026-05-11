'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { updateCartItem, getApiErrorMessage, getCart } from '@/features/cart/services/cart-api';
import { fetchProductBySlug } from '@/features/products/services/products-api';
import type { StockStatus } from '@/features/products/types';
import { getStockStatusClassName, getStockStatusLabel } from '@/features/products/utils';
import { formatCurrency } from '@/lib/utils';

type PdpSummaryProps = {
  productId: string;
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

function deriveStockStatus(quantity: number | undefined, fallback?: StockStatus): StockStatus {
  if (typeof quantity === 'number') {
    if (quantity <= 0) return 'OUT_OF_STOCK';
    if (quantity <= 5) return 'LOW_STOCK';
    return 'IN_STOCK';
  }

  return fallback ?? 'IN_STOCK';
}

export function PdpSummary({
  productId,
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
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveStockQuantity, setLiveStockQuantity] = useState<number | undefined>(stockQuantity);
  const [liveStockStatus, setLiveStockStatus] = useState<StockStatus>(
    deriveStockStatus(stockQuantity, stockStatus)
  );

  const isOutOfStock = liveStockStatus === 'OUT_OF_STOCK' || liveStockQuantity === 0;
  const maxQuantity = useMemo(() => {
    if (typeof liveStockQuantity !== 'number') return 99;
    return Math.max(1, liveStockQuantity);
  }, [liveStockQuantity]);

  const stockNote = useMemo(() => {
    if (typeof liveStockQuantity !== 'number') return 'Tồn kho theo thời gian thực';
    if (liveStockQuantity <= 0) return 'Sản phẩm đã hết hàng';
    if (liveStockQuantity <= 5) return `Chỉ còn ${liveStockQuantity} sản phẩm`;
    return `${liveStockQuantity} sản phẩm còn lại`;
  }, [liveStockQuantity]);

  const onChangeQuantity = (next: number) => {
    if (!Number.isFinite(next)) return;
    setQuantity(Math.min(Math.max(1, Math.trunc(next)), maxQuantity));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const currentCart = await getCart().catch(() => null);
      const inCart = currentCart?.items.find((item) => item.productId === productId)?.quantity ?? 0;
      const nextCartQuantity = inCart + quantity;

      await updateCartItem(productId, { quantity: nextCartQuantity });

      try {
        const refreshedProduct = await fetchProductBySlug(slug);
        setLiveStockQuantity(refreshedProduct.stockQuantity);
        setLiveStockStatus(deriveStockStatus(refreshedProduct.stockQuantity, refreshedProduct.stockStatus));
      } catch {
        if (typeof liveStockQuantity === 'number') {
          const nextQuantity = Math.max(0, liveStockQuantity - quantity);
          setLiveStockQuantity(nextQuantity);
          setLiveStockStatus(deriveStockStatus(nextQuantity, liveStockStatus));
        }
      }

      setQuantity(1);
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thêm sản phẩm vào giỏ hàng'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      <div className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
          {categoryName && <span>{categoryName}</span>}
          {categoryName && brandName && <span aria-hidden="true">•</span>}
          {brandName && <span>{brandName}</span>}
        </div>

        <h1 className="font-display text-3xl font-black text-text-primary">{name}</h1>

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

          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${getStockStatusClassName(liveStockStatus)}`}>
            {getStockStatusLabel(liveStockStatus)}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2 rounded-full bg-bg-base px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            {stockNote}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-bg-base px-3 py-2">
            <Heart className="h-4 w-4 text-danger" />
            Tồn kho cập nhật theo thời gian thực khi thêm giỏ hàng
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="pdp-quantity" className="text-sm font-semibold text-text-primary">
            Số lượng
          </label>
          <input
            id="pdp-quantity"
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(event) => onChangeQuantity(Number(event.target.value))}
            disabled={isOutOfStock || isSubmitting}
            className="h-10 w-24 rounded-xl border border-border bg-bg-base px-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          />
          {typeof liveStockQuantity === 'number' && (
            <span className="text-xs text-text-tertiary">Tối đa {maxQuantity} sản phẩm</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Đang thêm...' : isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/product"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-bg-base px-5 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
        >
          Xem thêm sản phẩm
        </Link>
        <Link
          href={`/search?keyword=${encodeURIComponent(name)}`}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-bg-base px-5 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
        >
          Tìm tương tự
        </Link>
      </div>
    </div>
  );
}
