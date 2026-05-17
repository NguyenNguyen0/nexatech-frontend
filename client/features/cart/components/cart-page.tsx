'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCart, updateCartItem, removeCartItem, clearCart, getApiErrorMessage } from '@/features/cart/services/cart-api';
import {
  CartItemRow,
  CartSummaryCard,
  CartPromoBox,
  CartLoadingState,
  CartEmptyState,
  CartErrorState,
} from '@/features/storefront/cart/components';
import type { Cart } from '@/types/cart';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Không thể tải giỏ hàng');
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(true);
    try {
      const updated = await updateCartItem(productId, { quantity });
      setCart(updated);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật số lượng thất bại'));
    } finally { setUpdating(false); }
  };

  const handleRemove = async (productId: string) => {
    setUpdating(true);
    try {
      const updated = await removeCartItem(productId);
      setCart(updated);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa sản phẩm thất bại'));
    } finally { setUpdating(false); }
  };

  const handleClearCart = async () => {
    setUpdating(true);
    try {
      await clearCart();
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa giỏ hàng thất bại'));
    } finally { setUpdating(false); }
  };

  if (loading) {
    return <CartLoadingState />;
  }

  if (errorMessage) {
    return <CartErrorState message={errorMessage} onRetry={fetchCart} />;
  }

  if (!cart || cart.items.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="flex-grow bg-surface-container-low py-8">
      <div className="max-w-container-max mx-auto px-gutter">
        <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">Giỏ hàng</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-headline-md font-headline-md text-on-surface">Giỏ hàng của bạn</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">{cart.totalItems} sản phẩm</p>
          </div>
          <button
            type="button"
            onClick={handleClearCart}
            disabled={updating}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-label-sm font-label-sm text-on-surface-variant transition hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-40 border border-outline-variant hover:border-error"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Xóa tất cả</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <div className="bg-surface rounded-xl border border-outline-variant p-2 sm:p-4 shadow-sm">
              <div className="flex flex-col">
                {cart.items.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    updating={updating}
                    onDecrease={handleUpdateQuantity}
                    onIncrease={handleUpdateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <CartPromoBox canUseCode={cart.totalItems > 0} />
            <CartSummaryCard totalItems={cart.totalItems} totalAmount={cart.totalAmount} updating={updating} />
            
            {updating ? (
              <div className="rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-label-sm text-on-surface-variant flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang cập nhật giỏ hàng...
              </div>
            ) : null}
            {cart.totalItems >= 3 ? (
              <div className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-label-sm text-success">
                Bạn đang đủ điều kiện miễn phí vận chuyển toàn quốc.
              </div>
            ) : (
              <div className="rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-3 text-label-sm text-secondary">
                Thêm {Math.max(0, 3 - cart.totalItems)} sản phẩm để nhận miễn phí vận chuyển.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
