import { Metadata } from 'next';
import { PaymentDashboard } from '@/app/payment/components/payment-dashboard';

export const metadata: Metadata = {
  title: 'Lịch sử thanh toán | NexaTech',
  description: 'Xem lịch sử các giao dịch thanh toán NexaTech của bạn',
};

export default function PaymentPage() {
  return <PaymentDashboard />;
}
