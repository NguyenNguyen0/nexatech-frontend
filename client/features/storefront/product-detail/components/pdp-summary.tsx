'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { updateCartItem, getApiErrorMessage, getCart } from '@/features/cart/services/cart-api';
import { fetchProductBySlug } from '@/features/products/services/products-api';
import type { StockStatus } from '@/features/products/types';
import { getStockStatusLabel } from '@/features/products/utils';
import { formatCurrency } from '@/lib/utils';
import { PdpPromotions } from './pdp-promotions';

const WISHLIST_KEY = 'nexatech_wishlist';

type WishlistItem = { productId: string; name: string; price: number; thumbnail?: string; slug: string; addedAt: string };

function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]'); } catch { return []; }
}

function toggleWishlist(item: Omit<WishlistItem, 'addedAt'>): boolean {
  const list = getWishlist();
  const idx = list.findIndex((i) => i.productId === item.productId);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('wishlist-updated'));
    return false;
  }
  list.push({ ...item, addedAt: new Date().toISOString() });
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('wishlist-updated'));
  return true;
}

type PdpSummaryProps = {
  productId: string;
  name: string;
  slug: string;
  categoryName?: string;
  brandName?: string;
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
  brandName,
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
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const list = getWishlist();
    setWishlisted(list.some((i) => i.productId === productId));
  }, [productId]);

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
      await updateCartItem(productId, { quantity: inCart + 1, priceOverride: flashSalePrice });
      toast.success('Đã thêm sản phẩm, chuyển đến giỏ hàng');
      router.push('/cart');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể mua ngay lúc này'));
    } finally {
      setIsBuyingNow(false);
    }
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
            className="material-symbols-outlined text-[15px] text-[#f5a623]"
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
          className={`flex items-center gap-1 font-semibold ${isOutOfStock ? 'text-error' : 'text-[#0a8a50]'}`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-error' : 'bg-[#0a8a50]'}`} />
          {stockStateText}
        </div>
      </div>

      {/* Price box */}
      <div className="rounded-md border border-[#c8dce8] bg-[#f0f6fa] p-4">
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
                <span className="text-[11px] font-bold text-white bg-[#e30019] px-2 py-0.5 rounded-sm">
                  -{discount}%
                </span>
              ) : null}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center text-[11px] bg-white border border-[#c8dce8] text-on-surface-variant px-2.5 py-1 rounded-sm">
            Trả góp 0%
          </span>
          <span className="inline-flex items-center text-[11px] bg-white border border-[#c8dce8] text-on-surface-variant px-2.5 py-1 rounded-sm">
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
          onClick={() => {
            const added = toggleWishlist({ productId, name, price, thumbnail, slug });
            setWishlisted(added);
            toast.success(added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
          }}
          className={`h-12 w-12 shrink-0 rounded-md border-2 flex items-center justify-center transition-all active:scale-[0.98] ${
            wishlisted
              ? 'border-[#e30019] bg-[#fff0f0] text-[#e30019]'
              : 'border-outline-variant bg-white text-on-surface-variant hover:border-[#e30019] hover:text-[#e30019] hover:bg-[#fff5f5]'
          }`}
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
    </div>
  );
}
