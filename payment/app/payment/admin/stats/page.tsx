import type { Metadata } from 'next';
import { AdminPaymentStats } from './components/payment-stats';

export const metadata: Metadata = {
  title: 'Thống kê thanh toán — NexaTech',
};

export default function AdminPaymentStatsPage() {
  return <AdminPaymentStats />;
}
