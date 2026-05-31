'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { trackBehavior } from '@/features/behavior/services/behavior-api';
import { updateCartItem, getApiErrorMessage, getCart } from '@/features/cart/services/cart-api';
import { fetchProductBySlug } from '@/features/products/services/products-api';
import type { StockStatus } from '@/features/products/types';
import { getStockStatusLabel } from '@/features/products/utils';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { cn, formatCurrency } from '@/lib/utils';
import { PRODUCT_CONSULT_CHAT_EVENT } from '@/components/shared/chat-widget';
import { PdpPromotions } from './pdp-promotions';

type PdpSummaryProps = {
  productId: string;
  name: string;
  slug: string;
  categoryName?: string;
  categoryIds?: string[];
  brandName?: string;
  brandId?: string;
  price: number;
  compareAtPrice?: number;
  /** Flash sale ID for this product (if active) */
  flashSaleId?: string;
  /** Flash sale price — used as priceOverride when adding to cart */
  flashSalePrice?: number;
  averageRating?: number;
  reviewCount?: number;
  stockStatus?: string;
  stockQuantity?: number;
  thumbnail?: string;
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
  categoryIds,
  brandName,
  brandId,
  price,
  compareAtPrice,
  flashSaleId,
  flashSalePrice,
  averageRating,
  reviewCount,
  stockStatus,
  stockQuantity,
  thumbnail,
}: PdpSummaryProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [liveStockQuantity, setLiveStockQuantity] = useState<number | undefined>(stockQuantity);
  const [liveStockStatus, setLiveStockStatus] = useState<StockStatus>(
    deriveStockStatus(stockQuantity, stockStatus)
  );
  const { isWishlisted, isMutating, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(productId);
  const isWishlistUpdating = isMutating(productId);

  useEffect(() => {
    setLiveStockQuantity(stockQuantity);
    setLiveStockStatus(deriveStockStatus(stockQuantity, stockStatus));
  }, [stockQuantity, stockStatus]);

  useEffect(() => {
    void trackBehavior({
      productId,
      eventType: 'VIEW',
      categoryIds,
      brandId,
      price,
    }).catch(() => {
      // Ignore analytics failures on product detail load.
    });
  }, [brandId, categoryIds, price, productId]);

  const isOutOfStock = liveStockStatus === 'OUT_OF_STOCK' || liveStockQuantity === 0;
  const stockStateText = useMemo(() => {
    const label = getStockStatusLabel(liveStockStatus);

    if (typeof liveStockQuantity === 'number' && liveStockQuantity > 0 && liveStockStatus !== 'IN_STOCK') {
      return `${label} (${liveStockQuantity})`;
    }

    return label;
  }, [liveStockQuantity, liveStockStatus]);

  const ratingText = typeof averageRating === 'number' ? averageRating.toFixed(1) : '0.0';

  const discount =
    typeof compareAtPrice === 'number' && compareAtPrice > price
      ? Math.round((1 - price / compareAtPrice) * 100)
      : null;

  const handleAddToCart = async () => {
    if (isOutOfStock || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const currentCart = await getCart().catch(() => null);
      const inCart = currentCart?.items.find((item) => item.productId === productId)?.quantity ?? 0;
      const nextCartQuantity = inCart + 1;

      await updateCartItem(productId, {
        quantity: nextCartQuantity,
        priceOverride: flashSalePrice,
        flashSaleId,
      });

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

      await trackBehavior({
        productId,
        eventType: 'CART_ADD',
        categoryIds,
        brandId,
        price,
      }).catch(() => {
        // Cart mutation must remain successful even if analytics fails.
      });

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
      await updateCartItem(productId, {
        quantity: inCart + 1,
        priceOverride: flashSalePrice,
        flashSaleId,
      });

      await trackBehavior({
        productId,
        eventType: 'CART_ADD',
        categoryIds,
        brandId,
        price,
      }).catch(() => {
        // Navigation to cart should not be blocked by analytics.
      });

      toast.success('Đã thêm sản phẩm, chuyển đến giỏ hàng');
      router.push('/cart');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể mua ngay lúc này'));
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleConsultProduct = () => {
    window.dispatchEvent(
      new CustomEvent(PRODUCT_CONSULT_CHAT_EVENT, {
        detail: {
          productId,
          slug,
          name,
          thumbnail,
          price,
        },
      }),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Brand / Category */}
      <div className="flex items-center gap-2">
        {brandName && (
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-sm">
            {brandName}
          </span>
        )}
        {categoryName && (
          <span className="text-[12px] text-on-surface-variant">{categoryName}</span>
        )}
      </div>

      {/* Product name */}
      <h1 className="text-[22px] font-bold leading-snug text-on-surface tracking-tight">{name}</h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-on-surface-variant border-b border-outline-variant pb-4">
        <div className="flex items-center gap-1">
          <span
            className="material-symbols-outlined text-[15px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-bold text-on-surface">{ratingText}</span>
          <span>({reviewCount ?? 0} đánh giá)</span>
        </div>
        <span className="text-outline-variant">|</span>
        <div>
          Mã SP:{' '}
          <span className="font-semibold text-on-surface">{productId.slice(0, 8).toUpperCase()}</span>
        </div>
        <span className="text-outline-variant">|</span>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-sm border px-2 py-1 font-extrabold uppercase tracking-wide',
            isOutOfStock
              ? 'border-red-300 bg-red-600 text-white shadow-sm'
              : liveStockStatus === 'LOW_STOCK'
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700',
          )}
        >
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              isOutOfStock ? 'bg-white' : liveStockStatus === 'LOW_STOCK' ? 'bg-amber-500' : 'bg-emerald-500',
            )}
          />
          {stockStateText}
        </div>
      </div>

      {/* Price box */}
      <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[28px] font-extrabold leading-none text-primary">
            {formatCurrency(price)}
          </span>
          {typeof compareAtPrice === 'number' && compareAtPrice > price && (
            <>
              <span className="text-[14px] text-on-surface-variant line-through">
                {formatCurrency(compareAtPrice)}
              </span>
              {discount ? (
                <span className="text-[11px] font-bold text-on-error bg-error px-2 py-0.5 rounded-sm">
                  -{discount}%
                </span>
              ) : null}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center text-[11px] bg-surface border border-primary/20 text-on-surface-variant px-2.5 py-1 rounded-sm">
            Trả góp 0%
          </span>
          <span className="inline-flex items-center text-[11px] bg-surface border border-primary/20 text-on-surface-variant px-2.5 py-1 rounded-sm">
            Bảo hành chính hãng 12 tháng
          </span>
        </div>
      </div>

      <PdpPromotions />

      {/* Action buttons */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isSubmitting || isBuyingNow}
          className="flex-1 h-12 rounded-md border-2 border-primary bg-white text-primary text-[14px] font-bold hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:border-outline-variant disabled:text-on-surface-variant"
        >
          <ShoppingCart className="h-4.5 w-4.5 shrink-0" />
          {isSubmitting ? 'Đang thêm...' : isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || isBuyingNow || isSubmitting}
          className="flex-1 h-12 rounded-md bg-primary text-white text-[14px] font-bold hover:bg-primary-dark active:scale-[0.98] transition-all flex items-center justify-center shadow-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:shadow-none"
        >
          {isBuyingNow ? 'Đang xử lý...' : isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
        </button>

		
        <button
          type="button"
          onClick={async () => {
            const next = await toggleWishlist(productId);
            if (typeof next === 'boolean') {
              toast.success(next ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
            }
          }}
          disabled={isWishlistUpdating}
          className={`h-12 w-12 shrink-0 rounded-md border-2 flex items-center justify-center transition-all active:scale-[0.98] ${
            wishlisted
              ? 'border-error bg-error/10 text-error'
              : 'border-outline-variant bg-white text-on-surface-variant hover:border-error hover:text-error hover:bg-error/5'
          } ${isWishlistUpdating ? 'cursor-not-allowed opacity-60' : ''}`}
          title={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleConsultProduct}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary/5 text-[14px] font-bold text-primary transition-all hover:bg-primary/10 active:scale-[0.99]"
      >
        <MessageCircle className="h-4.5 w-4.5 shrink-0" />
        Tư vấn sản phẩm
      </button>
    </div>
  );
}
