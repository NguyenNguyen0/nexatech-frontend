import { Metadata } from 'next';
import { OrderOverview } from '@/app/order/components/order-overview';

export const metadata: Metadata = {
  title: 'Tổng quan đơn hàng | NexaTech',
  description: 'Tổng quan và thống kê đơn hàng NexaTech của bạn',
};

export default function OrderOverviewPage() {
  return <OrderOverview />;
}