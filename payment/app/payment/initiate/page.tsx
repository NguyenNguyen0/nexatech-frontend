import { Metadata } from 'next';
import { PaymentForm } from '@/app/payment/initiate/components/payment-form';

export const metadata: Metadata = {
  title: 'Thanh toán đơn hàng | NexaTech',
  description: 'Chọn phương thức và thực hiện thanh toán',
};

export default function PaymentInitiatePage() {
  return <PaymentForm />;
}
