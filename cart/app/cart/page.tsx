'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { CartItemRow } from '@/components/cart-item-row';
import { CartSummary } from '@/components/cart-summary';
import { EmptyCart } from '@/components/empty-cart';
import { getCart, updateCartItem, removeCartItem, clearCart, getApiErrorMessage } from '@/lib/cartApi';
import type { Cart } from '@/types/cart';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể tải giỏ hàng'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(true);
    try {
      const updated = await updateCartItem(productId, { quantity });
      setCart(updated);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật số lượng thất bại'));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (productId: string) => {
    setUpdating(true);
    try {
      const updated = await removeCartItem(productId);
      setCart(updated);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa sản phẩm thất bại'));
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    setUpdating(true);
    try {
      await clearCart();
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa giỏ hàng thất bại'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Giỏ hàng</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {cart.totalItems} sản phẩm
            </p>
          </div>
        </div>

        <button
          onClick={handleClearCart}
          disabled={updating}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-destructive/5"
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">Xóa tất cả</span>
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="card-nexatech p-4 sm:p-6">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                disabled={updating}
              />
            ))}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div>
          <CartSummary cart={cart} loading={updating} />
        </div>
      </div>
    </div>
  );
}