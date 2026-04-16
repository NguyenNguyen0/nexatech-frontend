import { Metadata } from 'next';
import { PaymentHistory } from '@/app/orders/payments/components/payment-history';

export const metadata: Metadata = {
  title: 'Lịch sử thanh toán | NexaTech',
  description: 'Xem lịch sử các giao dịch thanh toán NexaTech của bạn',
};

export default function PaymentHistoryPage() {
  return <PaymentHistory />;
}