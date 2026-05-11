import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

type CartSummaryCardProps = {
  totalItems: number;
  totalAmount: number;
  updating: boolean;
};

export function CartSummaryCard({ totalItems, totalAmount, updating }: CartSummaryCardProps) {
  return (
    <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary">Tóm tắt đơn hàng</h3>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between text-text-secondary">
          <span>Số lượng sản phẩm</span>
          <span className="font-semibold text-text-primary">{totalItems}</span>
        </div>
        <div className="flex items-center justify-between text-text-secondary">
          <span>Tạm tính</span>
          <span className="font-semibold text-text-primary">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-text-secondary">
          <span>Phí vận chuyển</span>
          <span className="font-semibold text-success">Miễn phí</span>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-text-primary">Tổng cộng</span>
          <span className="text-xl font-black text-primary">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <Link
        href="/cart/checkout"
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        aria-disabled={updating}
      >
        Tiến hành thanh toán
      </Link>
    </section>
  );
}
