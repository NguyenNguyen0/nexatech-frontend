'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <ShoppingBag className="size-10 text-muted-foreground/60" />
      </div>

      <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
      <p className="text-muted-foreground text-sm text-center max-w-sm mb-8">
        Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi.
      </p>

      <Link
        href="http://localhost:3001/products"
        className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
      >
        Khám phá sản phẩm
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
