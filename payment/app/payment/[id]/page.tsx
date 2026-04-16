import { Metadata } from 'next';
import { PaymentDetailView } from '@/app/payment/[id]/components/payment-detail';

export const metadata: Metadata = {
  title: 'Chi tiết giao dịch | NexaTech',
  description: 'Xem chi tiết giao dịch thanh toán NexaTech',
};

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentDetailView paymentId={id} />;
}
