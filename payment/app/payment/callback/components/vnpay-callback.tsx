'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Home,
  Package,
  RefreshCw,
} from 'lucide-react';

function VNPayCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpOrderInfo = searchParams.get('vnp_OrderInfo');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');

    // Extract orderId from OrderInfo if possible
    if (vnpOrderInfo) {
      const match = vnpOrderInfo.match(/don hang ([a-f0-9-]+)/i);
      if (match) setOrderId(match[1]);
    }

    // VNPay: 00 means success
    if (vnpResponseCode === '00') {
      setStatus('success');
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang xác nhận kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-12 sm:py-20">
      <div className="card-nexatech p-10 text-center">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
              Giao dịch đã được xử lý thành công. Bạn có thể theo dõi đơn hàng tại trang quản lý đơn hàng.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {orderId && (
                <Link
                  href={`/orders/${orderId}`}
                  className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
                >
                  <Package className="size-4" />
                  Xem đơn hàng
                </Link>
              )}
              <Link
                href="/payment"
                className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
              >
                <ArrowRight className="size-4" />
                Lịch sử thanh toán
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <XCircle className="size-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Thanh toán thất bại</h1>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
              Giao dịch không thành công. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {orderId && (
                <Link
                  href={`/payment/initiate?orderId=${orderId}`}
                  className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
                >
                  <RefreshCw className="size-4" />
                  Thử lại
                </Link>
              )}
              <Link
                href="/payment"
                className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
              >
                <Home className="size-4" />
                Về trang thanh toán
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function VNPayCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <VNPayCallbackContent />
    </Suspense>
  );
}
