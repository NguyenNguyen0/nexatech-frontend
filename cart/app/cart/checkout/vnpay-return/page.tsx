'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  ArrowRight,
  Copy,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

type PaymentResult = {
  success: boolean;
  orderInfo: string;
  transactionNo: string;
  amount: number;
  responseCode: string;
};

function VNPayReturnContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const success = params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00';

    setResult({
      success,
      orderInfo: params.vnp_OrderInfo || '',
      transactionNo: params.vnp_TransactionNo || '',
      amount: parseInt(params.vnp_Amount || '0', 10) / 100,
      responseCode: params.vnp_ResponseCode || '',
    });
    setLoading(false);
  }, [searchParams]);

  const copyTransactionNo = () => {
    if (result?.transactionNo) {
      navigator.clipboard.writeText(result.transactionNo);
      toast.success('Đã sao chép mã giao dịch');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <Loader2 className="size-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Đang xác minh thanh toán...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
      {/* Result Icon */}
      <div className="relative mb-8">
        {result.success ? (
          <>
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle className="size-12 text-green-600" />
            </div>
            <div className="absolute -inset-3 rounded-full border-2 border-green-200 animate-ping opacity-20" />
          </>
        ) : (
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center animate-in zoom-in duration-500">
            <XCircle className="size-12 text-red-500" />
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-center">
        {result.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-8">
        {result.success
          ? 'Giao dịch VNPay của bạn đã được xác nhận. Đơn hàng đang được xử lý.'
          : 'Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}
      </p>

      {/* Payment Details Card */}
      <div className="card-nexatech p-6 w-full max-w-md mb-8">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Chi tiết giao dịch
          </h2>
        </div>

        <div className="space-y-4">
          {result.transactionNo && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mã giao dịch</span>
              <button
                onClick={copyTransactionNo}
                className="flex items-center gap-1.5 font-mono text-sm font-medium text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {result.transactionNo}
                <Copy className="size-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Số tiền</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }).format(result.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                result.success
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {result.success ? 'Thành công' : 'Thất bại'}
            </span>
          </div>

          {result.orderInfo && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nội dung</span>
              <span className="text-sm text-right max-w-50 truncate">
                {result.orderInfo}
              </span>
            </div>
          )}
        </div>

        {!result.success && (
          <div className="mt-5 p-3 rounded-xl bg-amber-50 flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Nếu tài khoản đã bị trừ tiền, giao dịch sẽ được hoàn lại trong 24-48 giờ.
              Liên hệ hotline <strong>1900 xxxx</strong> nếu cần hỗ trợ.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {result.success ? (
          <>
            <Link
              href="/orders"
              className="btn-pill flex-1 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="size-4" />
              Xem đơn hàng
            </Link>
            <Link
              href="/"
              className="btn-pill flex-1 bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center gap-2 cursor-pointer"
            >
              Tiếp tục mua sắm
              <ArrowRight className="size-4" />
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/cart"
              className="btn-pill flex-1 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer"
            >
              Quay lại giỏ hàng
            </Link>
            <Link
              href="/"
              className="btn-pill flex-1 bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center gap-2 cursor-pointer"
            >
              Về trang chủ
              <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="size-10 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Đang xác minh thanh toán...</p>
        </div>
      }
    >
      <VNPayReturnContent />
    </Suspense>
  );
}
