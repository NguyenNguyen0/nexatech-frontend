'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD:           'Thanh toán khi nhận hàng (COD)',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng (VietQR)',
  MOMO:          'Ví MoMo',
  VNPAY:         'VNPay',
  CREDIT_CARD:   'Thẻ tín dụng',
};

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get('orderNumber') ?? '---';
  const orderId     = params.get('orderId');

  // paymentMethod is the backend enum value (e.g. BANK_TRANSFER)
  const paymentMethodRaw = params.get('paymentMethod') ?? '';
  const paymentMethodLabel = PAYMENT_METHOD_LABEL[paymentMethodRaw] ?? paymentMethodRaw;

  return (
    <div className="flex-grow bg-surface-container-low py-12 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-xl w-full mx-auto px-gutter">
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
            <span
              className="material-symbols-outlined text-success text-[48px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>

          <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Đặt hàng thành công!</h1>
          <p className="text-body-md text-on-surface-variant mb-8">
            Cảm ơn bạn đã mua sắm tại NexaTech. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.
          </p>

          <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-5 mb-8 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant">
              <div className="text-label-sm font-label-sm text-on-surface-variant">Mã đơn hàng</div>
              <div className="text-title-lg font-title-lg text-primary font-bold">{orderNumber}</div>
            </div>

            <div className="flex flex-col gap-3">
              {paymentMethodLabel && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline mt-0.5">payments</span>
                  <div>
                    <div className="text-label-sm font-label-sm text-on-surface-variant">Phương thức thanh toán</div>
                    <div className="text-body-md font-medium text-on-surface">{paymentMethodLabel}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-outline mt-0.5">local_shipping</span>
                <div>
                  <div className="text-label-sm font-label-sm text-on-surface-variant">Giao hàng</div>
                  <div className="text-body-md font-medium text-on-surface">Dự kiến 3–5 ngày làm việc</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {orderId ? (
              <Link
                href={`/order/${orderId}`}
                className="flex-1 h-12 flex items-center justify-center gap-2 border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-highest transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                Theo dõi đơn hàng
              </Link>
            ) : (
              <Link
                href="/order"
                className="flex-1 h-12 flex items-center justify-center gap-2 border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-highest transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                Đơn hàng của tôi
              </Link>
            )}
            <Link
              href="/"
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center">
          <span className="text-on-surface-variant">Đang tải...</span>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
