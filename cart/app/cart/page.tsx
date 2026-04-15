'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      setCart({ customerId: cart?.customerId ?? '', items: [], totalItems: 0, totalPrice: 0 });
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
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{cart.totalItems} sản phẩm</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                disabled={updating}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4 mr-1" />
                Xóa tất cả
              </Button>
            </CardHeader>
            <CardContent>
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  disabled={updating}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <CartSummary cart={cart} loading={updating} />
        </div>
      </div>
    </div>
  );
}