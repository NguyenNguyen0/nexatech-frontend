import { Metadata } from 'next';
import { OrderList } from '@/app/orders/components/order-list';

export const metadata: Metadata = {
  title: 'Đơn hàng của tôi | NexaTech',
  description: 'Danh sách tất cả đơn hàng NexaTech của bạn',
};

export default function OrdersPage() {
  return <OrderList />;
}