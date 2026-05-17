import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export function CartEmptyState() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-4xl border border-dashed border-border bg-bg-elevated px-6 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-text-tertiary/40" />
        <h2 className="mt-4 text-2xl font-bold text-text-primary">Giỏ hàng trống</h2>
        <p className="mt-2 text-sm text-text-secondary">Hãy thêm sản phẩm để bắt đầu đơn hàng của bạn.</p>
        <Link
          href="/product"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-bg-base px-5 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    </div>
  );
}
