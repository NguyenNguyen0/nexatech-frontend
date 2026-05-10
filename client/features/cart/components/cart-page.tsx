'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Giỏ hàng</h1>
            <p className="mt-0.5 text-sm text-text-secondary">{cart.totalItems} sản phẩm</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearCart}
          disabled={updating}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-text-secondary transition hover:bg-danger/5 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Xóa tất cả</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
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
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <CartSummaryCard totalItems={cart.totalItems} totalAmount={cart.totalAmount} updating={updating} />
          <CartPromoBox canUseCode={cart.totalItems > 0} />
          {updating ? (
            <div className="rounded-2xl border border-border bg-bg-base px-4 py-3 text-xs text-text-secondary">
              Hệ thống đang cập nhật giỏ hàng của bạn...
            </div>
          ) : null}
          {cart.totalItems >= 3 ? (
            <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-xs text-success">
              Bạn đang đủ điều kiện miễn phí vận chuyển toàn quốc.
            </div>
          ) : (
            <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-xs text-warning-dark">
              Thêm {Math.max(0, 3 - cart.totalItems)} sản phẩm để nhận miễn phí vận chuyển ưu tiên.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
