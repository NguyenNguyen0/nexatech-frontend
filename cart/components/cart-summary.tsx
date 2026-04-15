'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/format';
import type { Cart } from '@/types/cart';

interface CartSummaryProps {
  cart: Cart;
  loading?: boolean;
}

export function CartSummary({ cart, loading }: CartSummaryProps) {
  const shippingFee = cart.totalPrice >= 500000 ? 0 : 30000;
  const total = cart.totalPrice + shippingFee;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Tổng đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tạm tính ({cart.totalItems} sản phẩm)</span>
          <span>{formatCurrency(cart.totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
        </div>
        {shippingFee > 0 && (
          <p className="text-xs text-muted-foreground">
            Miễn phí vận chuyển cho đơn từ {formatCurrency(500000)}
          </p>
        )}
        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Link href="/cart/checkout" className="w-full">
          <Button className="w-full" size="lg" disabled={loading || cart.totalItems === 0}>
            Tiến hành thanh toán
          </Button>
        </Link>
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full" size="lg">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
