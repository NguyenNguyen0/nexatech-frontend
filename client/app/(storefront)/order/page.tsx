import type { Metadata } from 'next';
import OrderListPage from '@/features/order/components/order-list-page';

export const metadata: Metadata = { title: 'Theo dõi đơn hàng' };

export default function OrderPage() {
  return <OrderListPage />;
}
