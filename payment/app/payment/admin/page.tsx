import type { Metadata } from 'next';
import { AdminPaymentList } from './components/admin-payment-list';

export const metadata: Metadata = {
  title: 'Quản trị thanh toán — NexaTech',
};

export default function AdminPaymentsPage() {
  return <AdminPaymentList />;
}
