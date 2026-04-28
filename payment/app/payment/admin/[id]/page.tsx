import type { Metadata } from 'next';
import { AdminPaymentDetail } from './components/admin-payment-detail';

export const metadata: Metadata = {
  title: 'Chi tiết thanh toán (Admin) — NexaTech',
};

export default function AdminPaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <AdminPaymentDetail paymentId={params.id} />;
}
