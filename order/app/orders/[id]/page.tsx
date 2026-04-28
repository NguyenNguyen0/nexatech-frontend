import { Metadata } from 'next';
import { OrderDetail } from '@/app/orders/[id]/components/order-detail';

export const metadata: Metadata = {
  title: 'Chi tiết đơn hàng | NexaTech',
  description: 'Xem chi tiết đơn hàng NexaTech của bạn',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}