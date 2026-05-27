import type { Metadata } from 'next';
import OrderListPage from '@/features/order/components/order-list-page';

export const metadata: Metadata = { title: 'Lịch sử đơn hàng' };

export default function UserOrdersPage() {
  return <OrderListPage variant="account" />;
}
