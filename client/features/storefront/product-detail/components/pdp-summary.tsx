'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { updateCartItem, getApiErrorMessage, getCart } from '@/features/cart/services/cart-api';
import { fetchProductBySlug } from '@/features/products/services/products-api';
import type { StockStatus } from '@/features/products/types';
import { getStockStatusClassName, getStockStatusLabel } from '@/features/products/utils';
import { formatCurrency } from '@/lib/utils';
import { PdpPromotions } from './pdp-promotions';

type PdpSummaryProps = {
  productId: string;
  name: string;
  slug: string;
  categoryName?: string;
  brandName?: string;
  price: number;
  compareAtPrice?: number;
  averageRating?: number;
  reviewCount?: number;
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
  reviewCount,
  stockStatus,
  stockQuantity,
}: PdpSummaryProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [liveStockQuantity, setLiveStockQuantity] = useState<number | undefined>(stockQuantity);
  const [liveStockStatus, setLiveStockStatus] = useState<StockStatus>(
    deriveStockStatus(stockQuantity, stockStatus)
  );

  const isOutOfStock = liveStockStatus === 'OUT_OF_STOCK' || liveStockQuantity === 0;
  const stockStateText = useMemo(() => {
    const label = getStockStatusLabel(liveStockStatus);

    if (typeof liveStockQuantity === 'number' && liveStockQuantity > 0 && liveStockStatus !== 'IN_STOCK') {
      return `${label} (${liveStockQuantity})`;
    }

    return label;
  }, [liveStockQuantity, liveStockStatus]);

  const ratingText = typeof averageRating === 'number' ? averageRating.toFixed(1) : '0.0';

  const handleAddToCart = async () => {
    if (isOutOfStock || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const currentCart = await getCart().catch(() => null);
      const inCart = currentCart?.items.find((item) => item.productId === productId)?.quantity ?? 0;
      const nextCartQuantity = inCart + 1;

      await updateCartItem(productId, { quantity: nextCartQuantity });

      try {
        const refreshedProduct = await fetchProductBySlug(slug);
        setLiveStockQuantity(refreshedProduct.stockQuantity);
        setLiveStockStatus(deriveStockStatus(refreshedProduct.stockQuantity, refreshedProduct.stockStatus));
      } catch {
        if (typeof liveStockQuantity === 'number') {
          const nextQuantity = Math.max(0, liveStockQuantity - 1);
          setLiveStockQuantity(nextQuantity);
          setLiveStockStatus(deriveStockStatus(nextQuantity, liveStockStatus));
        }
      }

      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thêm sản phẩm vào giỏ hàng'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock || isBuyingNow) return;

    setIsBuyingNow(true);

    try {
      const currentCart = await getCart().catch(() => null);
      const inCart = currentCart?.items.find((item) => item.productId === productId)?.quantity ?? 0;
      await updateCartItem(productId, { quantity: inCart + 1 });
      toast.success('Đã thêm sản phẩm, chuyển đến giỏ hàng');
      router.push('/cart');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể mua ngay lúc này'));
    } finally {
      setIsBuyingNow(false);
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

        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-semibold text-warning-dark">{ratingText}</span>
            <span>({reviewCount ?? 0} đánh giá)</span>
          </span>
          <span aria-hidden="true" className="text-border">|</span>
          <span>
            Mã SP: <span className="font-semibold text-text-primary">{productId}</span>
          </span>
          <span aria-hidden="true" className="text-border">|</span>
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStockStatusClassName(liveStockStatus)}`}>
            Tình trạng: {stockStateText}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-bg-base p-4">
          <div className="flex flex-wrap items-end gap-4">
            <span className="text-4xl font-black text-danger">{formatCurrency(price)}</span>
            {typeof compareAtPrice === 'number' && compareAtPrice > price && (
              <span className="mb-1 text-base font-semibold text-text-tertiary line-through">{formatCurrency(compareAtPrice)}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              Trả góp 0%
            </span>
            <span className="inline-flex items-center rounded-lg border border-border bg-bg-elevated px-2.5 py-1 text-xs font-semibold text-text-primary">
              Bảo hành chính hãng 12 tháng
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <PdpPromotions />

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isBuyingNow || isSubmitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-danger px-5 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Zap className="h-4 w-4" />
            {isBuyingNow ? 'Đang xử lý...' : isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isSubmitting || isBuyingNow}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-bg-base px-5 text-sm font-bold uppercase tracking-widest text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart className="h-4 w-4" />
            {isSubmitting ? 'Đang thêm...' : isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
}
