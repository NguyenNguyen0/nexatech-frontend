import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StorefrontEmptyState } from '@/features/storefront/shared/components/storefront-empty-state';
import { formatCurrency } from '@/lib/utils';

type AccountOrderItem = {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
};

type AccountOrderHistoryProps = {
  orders: AccountOrderItem[];
};

export function AccountOrderHistory({ orders }: AccountOrderHistoryProps) {
  return (
    <section id="orders" className="rounded-md border border-border bg-bg-elevated p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Lịch sử đơn hàng</h3>
        <Link href="/user#orders" className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-dark">
          Xem tất cả
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <StorefrontEmptyState
          className="mt-4 bg-bg-base"
          title="Chưa có đơn hàng"
          description="Các đơn hàng mới sẽ xuất hiện tại đây để bạn theo dõi trạng thái giao hàng."
        />
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-bg-base px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">Đơn #{order.id}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{order.createdAt}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
