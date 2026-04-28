import { Metadata } from 'next';
import { VNPayCallback } from '@/app/payment/callback/components/vnpay-callback';

export const metadata: Metadata = {
  title: 'Kết quả thanh toán | NexaTech',
  description: 'Kết quả thanh toán VNPay',
};

export default function VNPayCallbackPage() {
  return <VNPayCallback />;
}
