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
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-label-sm uppercase tracking-wider text-on-surface-variant font-bold mb-2">
          {categoryName && <span>{categoryName}</span>}
          {categoryName && brandName && <span>•</span>}
          {brandName && <span>{brandName}</span>}
        </div>
        
        <h1 className="text-display-sm font-display-sm text-on-surface mb-3">{name}</h1>
        
        <div className="flex flex-wrap items-center gap-3 text-body-md text-on-surface-variant">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-bold text-on-surface">{ratingText}</span>
            <span>({reviewCount ?? 0} đánh giá)</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1">
            <span>Mã SP:</span>
            <span className="font-bold text-on-surface">{productId.slice(0, 8).toUpperCase()}</span>
          </div>
          <span>|</span>
          <div className={`text-label-sm font-bold ${isOutOfStock ? 'text-error' : 'text-primary'}`}>
            {stockStateText}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
        <div className="flex items-end gap-3 mb-3">
          <span className="text-display-md font-display-md text-primary">{formatCurrency(price)}</span>
          {typeof compareAtPrice === 'number' && compareAtPrice > price && (
            <>
              <span className="text-title-md font-title-md text-on-surface-variant line-through mb-1">
                {formatCurrency(compareAtPrice)}
              </span>
              {discount ? (
                <span className="bg-error text-on-error text-label-sm font-bold px-2 py-1 rounded-md mb-2">
                  -{discount}%
                </span>
              ) : null}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-lg bg-surface px-2.5 py-1 text-label-sm border border-outline-variant text-on-surface-variant">
            Trả góp 0%
          </span>
          <span className="inline-flex items-center rounded-lg bg-surface px-2.5 py-1 text-label-sm border border-outline-variant text-on-surface-variant">
            Bảo hành chính hãng 12 tháng
          </span>
        </div>
      </div>

      <PdpPromotions />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isSubmitting || isBuyingNow}
          className="flex-1 h-12 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:border-outline disabled:text-on-surface-variant"
        >
          <ShoppingCart className="h-5 w-5" />
          {isSubmitting ? 'Đang thêm...' : isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
        <button
          type="button"
          onClick={() => {
            const added = toggleWishlist({ productId, name, price, thumbnail, slug });
            setWishlisted(added);
            toast.success(added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
          }}
          className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-colors ${
            wishlisted
              ? 'border-error bg-error/10 text-error'
              : 'border-outline-variant text-on-surface-variant hover:border-error hover:text-error'
          }`}
          title={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || isBuyingNow || isSubmitting}
          className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-container-high disabled:text-on-surface-variant"
        >
          {isBuyingNow ? 'Đang xử lý...' : isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
        </button>
      </div>
    </div>
  );
}
