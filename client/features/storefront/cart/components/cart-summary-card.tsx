import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

type CartSummaryCardProps = {
  totalItems: number;
  totalAmount: number;
  updating: boolean;
};

export function CartSummaryCard({ totalItems, totalAmount, updating }: CartSummaryCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm sticky top-24">
      <h2 className="text-title-lg font-title-lg text-on-surface mb-6 border-b border-outline-variant pb-4">Tóm tắt đơn hàng</h2>
      
      <div className="flex flex-col gap-3 mb-6 border-b border-outline-variant pb-6">
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span>Tạm tính ({totalItems} sản phẩm)</span>
          <span className="font-medium text-on-surface">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span>Phí vận chuyển</span>
          <span className="font-medium text-on-surface">Miễn phí</span>
        </div>
        <div className="flex justify-between text-body-md text-secondary">
          <span>Giảm giá</span>
          <span className="font-medium">-0₫</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-8">
        <span className="text-title-lg font-title-lg text-on-surface">Tổng cộng</span>
        <div className="text-right">
          <span className="block text-price-lg font-price-lg text-secondary">{formatCurrency(totalAmount)}</span>
          <span className="text-[11px] text-on-surface-variant">(Đã bao gồm VAT)</span>
        </div>
      </div>

      <Link
        href="/cart/checkout"
        className="w-full h-14 bg-secondary hover:bg-secondary-container text-on-secondary text-title-lg font-title-lg rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
        aria-disabled={updating}
      >
        Tiến hành thanh toán
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </Link>
    </div>
  );
}
