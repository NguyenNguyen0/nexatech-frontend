'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getOrderById } from '@/features/order/services/order-api';
import { clearCart } from '@/features/cart/services/cart-api';
import type { OrderStatus } from '@/types/order';

const RECENT_GUEST_ORDERS_KEY = 'nexatech_recent_orders';

function rememberRecentOrder(orderId: string, orderNumber: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(RECENT_GUEST_ORDERS_KEY);
    const current = raw ? JSON.parse(raw) as Array<{ id: string; orderNumber: string; createdAt: string }> : [];
    const next = [
      { id: orderId, orderNumber, createdAt: new Date().toISOString() },
      ...current.filter((item) => item.id !== orderId),
    ].slice(0, 5);
    window.localStorage.setItem(RECENT_GUEST_ORDERS_KEY, JSON.stringify(next));
  } catch {
    /* recent order history is best-effort */
  }
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD:           'Thanh toán khi nhận hàng (COD)',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng (VietQR)',
  MOMO:          'Ví MoMo',
  VNPAY:         'VNPay',
  CREDIT_CARD:   'Thẻ tín dụng',
};

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 10; // 30 giây tổng cộng

const COMPENSATION_STATUSES: OrderStatus[] = ['OUT_OF_STOCK', 'SHIPPING_FAILED', 'REFUND_PENDING', 'REFUNDED'];

const COMPENSATION_COPY: Partial<Record<OrderStatus, string>> = {
  OUT_OF_STOCK: 'Sản phẩm hiện tại của bạn đang đặt đã hết số lượng, vui lòng đặt sản phẩm khác, xin lỗi vì bất tiện này',
  SHIPPING_FAILED: 'Đơn hàng đã thanh toán thành công nhưng hiện chưa thể tạo đơn giao hàng. Hệ thống sẽ xử lý hoàn tiền cho bạn.',
  REFUND_PENDING: 'Đơn hàng đang được xử lý hoàn tiền.',
  REFUNDED: 'Đơn hàng đã được hoàn tiền.',
};

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get('orderNumber') ?? '---';
  const orderId     = params.get('orderId');

  // paymentMethod is the backend enum value (e.g. BANK_TRANSFER)
  const paymentMethodRaw = params.get('paymentMethod') ?? '';
  const paymentMethodLabel = PAYMENT_METHOD_LABEL[paymentMethodRaw] ?? paymentMethodRaw;

  const isVnpay = paymentMethodRaw === 'VNPAY';

  // Polling state for VNPAY race condition: IPN có thể chậm hơn Return URL
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [pollError, setPollError] = useState(false);
  const pollAttemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!orderId || !orderNumber || orderNumber === '---') return;
    rememberRecentOrder(orderId, orderNumber);
    void clearCart();
    try {
      localStorage.removeItem('nexatech_pending_order');
      sessionStorage.removeItem('nexatech_pending_order');
    } catch {
      // ignore storage errors
    }
  }, [orderId, orderNumber]);

  useEffect(() => {
    if (!orderId) return;

    const poll = async () => {
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) return;
      pollAttemptsRef.current += 1;

      try {
        const order = await getOrderById(orderId);
        setOrderStatus(order.status);

        const stillSettling = ['PENDING', 'CONFIRMED'].includes(order.status);
        if (stillSettling && pollAttemptsRef.current < MAX_POLL_ATTEMPTS) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        setPollError(true);
      }
    };

    poll();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId]);

  // Trạng thái chờ xác nhận VNPay (IPN chưa tới)
  const isAwaitingVnpay = isVnpay && orderId && orderStatus === 'PENDING';
  // Hết giới hạn poll mà vẫn PENDING
  const isPollTimeout = isVnpay && orderId && orderStatus === 'PENDING'
    && pollAttemptsRef.current >= MAX_POLL_ATTEMPTS;
  const isCompensation = orderStatus != null && COMPENSATION_STATUSES.includes(orderStatus);
  const compensationCopy = orderStatus ? COMPENSATION_COPY[orderStatus] : undefined;

  return (
    <div className="flex-grow bg-surface-container-low py-12 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-xl w-full mx-auto px-gutter">
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-8 text-center flex flex-col items-center">

          {/* Icon trạng thái */}
          {isCompensation ? (
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-6">
              <span
                className="material-symbols-outlined text-error text-[48px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
            </div>
          ) : isAwaitingVnpay && !isPollTimeout ? (
            <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <span
                className="material-symbols-outlined text-warning text-[48px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                hourglass_top
              </span>
            </div>
          ) : (
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
              <span
                className="material-symbols-outlined text-success text-[48px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
          )}

          {/* Tiêu đề & mô tả */}
          {isCompensation ? (
            <>
              <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Đơn hàng cần xử lý hoàn tiền</h1>
              <p className="text-body-md text-on-surface-variant mb-8">
                {compensationCopy}
              </p>
            </>
          ) : isAwaitingVnpay && !isPollTimeout ? (
            <>
              <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Đang xác nhận thanh toán...</h1>
              <p className="text-body-md text-on-surface-variant mb-8">
                Hệ thống đang chờ xác nhận từ VNPay. Vui lòng không đóng trang này.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Đặt hàng thành công!</h1>
              <p className="text-body-md text-on-surface-variant mb-8">
                {isPollTimeout && !pollError
                  ? 'Thanh toán đang được xử lý. Bạn sẽ nhận được thông báo xác nhận sớm.'
                  : 'Cảm ơn bạn đã mua sắm tại NexaTech. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.'}
              </p>
            </>
          )}

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

              {/* Trạng thái thanh toán VNPay */}
              {isVnpay && orderId && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline mt-0.5">
                    {isAwaitingVnpay && !isPollTimeout ? 'sync' : 'verified'}
                  </span>
                  <div>
                    <div className="text-label-sm font-label-sm text-on-surface-variant">Trạng thái thanh toán</div>
                    <div className={`text-body-md font-medium ${isCompensation ? 'text-error' : isAwaitingVnpay && !isPollTimeout ? 'text-warning' : 'text-success'}`}>
                      {isCompensation
                        ? 'Đang xử lý hoàn tiền'
                        : isAwaitingVnpay && !isPollTimeout
                        ? 'Đang chờ xác nhận từ VNPay...'
                        : (orderStatus === 'CONFIRMED' || orderStatus === 'PROCESSING')
                          ? 'Đã thanh toán thành công'
                          : 'Đang xử lý'}
                    </div>
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
