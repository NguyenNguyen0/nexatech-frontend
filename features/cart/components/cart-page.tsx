'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { getCart, updateCartItem, removeCartItem, clearCart, getApiErrorMessage } from '@/features/cart/services/cart-api';
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
      <div className="mx-auto max-w-5xl px-4 py-8 page-transition">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="size-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 page-transition">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Giỏ hàng</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{cart.totalItems} sản phẩm</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="card-nexatech p-4 sm:p-6">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.productName}</p>
                  <p className="text-primary font-bold">{item.totalPrice.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} disabled={updating} className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-muted">-</button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} disabled={updating} className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-muted">+</button>
                </div>
                <button onClick={() => handleRemove(item.productId)} disabled={updating} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card-nexatech p-6 sticky top-20">
            <h3 className="font-semibold mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{cart.totalAmount.toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phí vận chuyển</span><span className="text-green-600">Miễn phí</span></div>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-primary">{cart.totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
            <a href="/cart/checkout" className="mt-4 block w-full text-center bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Tiến hành thanh toán
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
