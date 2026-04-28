'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Wallet,
  ArrowLeft,
  Loader2,
  Truck,
  Banknote,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createPayment, createVNPayPayment, getPaymentErrorMessage } from '@/lib/paymentApi';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@/types/payment';

const METHODS: { value: PaymentMethod; icon: React.ReactNode; description: string }[] = [
  {
    value: PaymentMethod.VNPAY,
    icon: <CreditCard className="size-5" />,
    description: 'Thanh toán qua cổng VNPay an toàn',
  },
  {
    value: PaymentMethod.COD,
    icon: <Truck className="size-5" />,
    description: 'Thanh toán khi nhận hàng',
  },
  {
    value: PaymentMethod.BANK_TRANSFER,
    icon: <Banknote className="size-5" />,
    description: 'Chuyển khoản ngân hàng nội địa',
  },
  {
    value: PaymentMethod.MOMO,
    icon: <Smartphone className="size-5" />,
    description: 'Thanh toán qua ví MoMo',
  },
];

function PaymentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const amount = Number(searchParams.get('amount')) || 0;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!orderId) {
      toast.error('Không tìm thấy mã đơn hàng.');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedMethod === PaymentMethod.VNPAY) {
        const res = await createVNPayPayment({
          orderId,
          amount,
          orderInfo: `Thanh toan don hang ${orderId}`,
        });
        window.location.href = res.paymentUrl;
        return;
      }

      await createPayment({ orderId, amount, method: selectedMethod });
      toast.success('Tạo thanh toán thành công!');
      router.push('/payment');
    } catch (err) {
      toast.error(getPaymentErrorMessage(err, 'Không thể thực hiện thanh toán'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <Link
        href="/payment"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        Quay lại lịch sử thanh toán
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Wallet className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thanh toán đơn hàng</h1>
          {orderId && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Đơn hàng: <span className="font-mono">{orderId.slice(0, 8)}...</span>
            </p>
          )}
        </div>
      </div>

      {/* Amount */}
      {amount > 0 && (
        <div className="card-nexatech p-6 text-center mb-6">
          <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
          <p className="text-3xl font-bold text-primary mt-1">
            {amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </p>
        </div>
      )}

      {/* No orderId warning */}
      {!orderId && (
        <div className="card-nexatech p-6 mb-6 border-amber-200 bg-amber-50 text-center">
          <p className="text-sm text-amber-800">
            Vui lòng truy cập từ trang đơn hàng để thực hiện thanh toán.
          </p>
          <Link
            href="/orders"
            className="btn-pill mt-4 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 cursor-pointer"
          >
            Đi tới đơn hàng
            <ChevronRight className="size-4" />
          </Link>
        </div>
      )}

      {/* Method selection */}
      {orderId && (
        <>
          <h2 className="font-semibold text-lg mb-4">Chọn phương thức thanh toán</h2>
          <div className="space-y-3 mb-8">
            {METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMethod(m.value)}
                className={`w-full card-nexatech p-5 flex items-center gap-4 text-left transition-all cursor-pointer ${
                  selectedMethod === m.value
                    ? 'ring-2 ring-primary/50 border-primary/20'
                    : ''
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    selectedMethod === m.value
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {PAYMENT_METHOD_LABELS[m.value] || m.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 transition-all ${
                    selectedMethod === m.value
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedMethod === m.value && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full btn-pill bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3 text-base font-semibold cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CreditCard className="size-5" />
                Thanh toán ngay
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

export function PaymentForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentFormContent />
    </Suspense>
  );
}
