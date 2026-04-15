'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { Cart } from '@/types/cart';

interface CartSummaryProps {
  cart: Cart;
  loading?: boolean;
}

export function CartSummary({ cart, loading }: CartSummaryProps) {
  const shippingFee = cart.totalAmount >= 500000 ? 0 : 30000;
  const total = cart.totalAmount + shippingFee;

  return (
    <div className="card-nexatech p-6 sticky top-6">
      <h2 className="font-semibold text-lg mb-5">Tóm tắt đơn hàng</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tạm tính ({cart.totalItems} sản phẩm)</span>
          <span className="font-medium">{formatCurrency(cart.totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span className="font-medium">
            {shippingFee === 0 ? (
              <span className="text-green-600">Miễn phí</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>
        {cart.totalAmount < 500000 && (
          <p className="text-xs text-muted-foreground bg-accent/50 rounded-xl px-3 py-2">
            Mua thêm <span className="font-semibold text-primary">{formatCurrency(500000 - cart.totalAmount)}</span> để được miễn phí vận chuyển
          </p>
        )}
      </div>

      <div className="border-t border-border/50 mt-4 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold">Tổng cộng</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>

      <Link
        href="/cart/checkout"
        className={`btn-pill w-full mt-5 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 ${
          loading ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        Tiến hành thanh toán
        <ArrowRight className="size-4" />
      </Link>

      {/* Trust badges */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-green-600 shrink-0" />
          <span>Thanh toán an toàn & bảo mật</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <Truck className="size-4 text-primary shrink-0" />
          <span>Giao hàng nhanh 1-3 ngày</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <RotateCcw className="size-4 text-orange-500 shrink-0" />
          <span>Đổi trả miễn phí trong 30 ngày</span>
        </div>
      </div>
    </div>
  );
}
