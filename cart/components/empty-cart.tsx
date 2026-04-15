'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShoppingCart className="size-16 text-muted-foreground/40 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
      <p className="text-muted-foreground mb-6">Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
      <Link href="/">
        <Button size="lg">Khám phá sản phẩm</Button>
      </Link>
    </div>
  );
}
