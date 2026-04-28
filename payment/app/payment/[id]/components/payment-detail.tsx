'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Receipt,
  Copy,
  Package,
  AlertTriangle,
  CalendarCheck,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { getPaymentById, getPaymentErrorMessage } from '@/lib/paymentApi';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Payment } from '@/types/payment';
import { PaymentStatus, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_CONFIG } from '@/types/payment';
import { PaymentStatusBadge } from '@/components/custom/payment/status-badge';

const STATUS_ICONS: Record<PaymentStatus, React.ReactNode> = {
  [PaymentStatus.PENDING]: <Clock className="size-6 text-amber-600" />,
  [PaymentStatus.PROCESSING]: <Loader2 className="size-6 text-blue-600 animate-spin" />,
  [PaymentStatus.COMPLETED]: <CheckCircle className="size-6 text-green-600" />,
  [PaymentStatus.FAILED]: <XCircle className="size-6 text-red-500" />,
  [PaymentStatus.REFUNDED]: <RefreshCcw className="size-6 text-indigo-600" />,
  [PaymentStatus.CANCELLED]: <XCircle className="size-6 text-gray-500" />,
};

interface PaymentDetailViewProps {
  paymentId: string;
}

export function PaymentDetailView({ paymentId }: PaymentDetailViewProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  const fetchPayment = useCallback(async () => {
    try {
      const data = await getPaymentById(paymentId);
      setPayment(data);
    } catch (err) {
      toast.error(getPaymentErrorMessage(err, 'Không tìm thấy giao dịch'));
      router.replace('/payment');
    } finally {
      setLoading(false);
    }
  }, [paymentId, router]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const copyTransactionId = async () => {
    if (!payment?.transactionId) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(payment.transactionId);
      toast.success('Đã sao chép mã giao dịch');
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải chi tiết giao dịch...</p>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const config = PAYMENT_STATUS_CONFIG[payment.status];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <Link
        href="/payment"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        Quay lại lịch sử thanh toán
      </Link>

      {/* Status Header */}
      <div className="card-nexatech p-8 text-center mb-6">
        <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
          {STATUS_ICONS[payment.status]}
        </div>
        <PaymentStatusBadge status={payment.status} className="text-sm px-4 py-2 mb-3" />
        <p className="text-3xl font-bold mt-3">{formatCurrency(payment.amount)}</p>
        <p className="text-sm text-muted-foreground mt-2">{formatDate(payment.createdAt)}</p>
      </div>

      {/* Failure reason alert */}
      {payment.status === PaymentStatus.FAILED && payment.failureReason && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Lý do thất bại</p>
            <p className="text-sm text-red-600 mt-0.5">{payment.failureReason}</p>
          </div>
        </div>
      )}

      {/* Refunded notice */}
      {payment.status === PaymentStatus.REFUNDED && (
        <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6">
          <RefreshCcw className="size-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-700">Giao dịch đã được hoàn tiền</p>
            <p className="text-sm text-indigo-600 mt-0.5">
              Số tiền {formatCurrency(payment.amount)} đã được hoàn trả về tài khoản của bạn.
            </p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="card-nexatech p-6 space-y-5 mb-6">
        <h2 className="font-semibold text-lg">Chi tiết giao dịch</h2>

        <div className="divide-y divide-border/50">
          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-muted-foreground">Phương thức</span>
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <span className="font-medium text-sm">
                {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <PaymentStatusBadge status={payment.status} />
          </div>

          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-muted-foreground">Số tiền</span>
            <span className="font-bold text-primary">{formatCurrency(payment.amount)}</span>
          </div>

          {payment.transactionId && (
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-muted-foreground">Mã giao dịch</span>
              <button
                onClick={copyTransactionId}
                className={`flex items-center gap-1.5 font-mono text-xs bg-secondary px-3 py-1.5 rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer ${copying ? 'opacity-60' : ''}`}
              >
                {payment.transactionId}
                <Copy className="size-3" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-muted-foreground">Thời gian tạo</span>
            <span className="text-sm">{formatDate(payment.createdAt)}</span>
          </div>

          {payment.completedAt && (
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <CalendarCheck className="size-3.5" />
                Hoàn thành lúc
              </span>
              <span className="text-sm text-green-600 font-medium">{formatDate(payment.completedAt)}</span>
            </div>
          )}

          {payment.updatedAt && payment.updatedAt !== payment.createdAt && !payment.completedAt && (
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-muted-foreground">Cập nhật lần cuối</span>
              <span className="text-sm">{formatDate(payment.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Order link */}
      <div className="card-nexatech p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
            <Package className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Đơn hàng liên quan</p>
            <p className="text-xs text-muted-foreground">ID: {payment.orderId}</p>
          </div>
        </div>
        <Link
          href={`/orders/${payment.orderId}`}
          className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Package className="size-4" />
          Xem đơn hàng
        </Link>
      </div>

      {/* Retry payment if failed */}
      {payment.status === PaymentStatus.FAILED && (
        <div className="mt-4">
          <Link
            href={`/payment/initiate?orderId=${payment.orderId}&amount=${payment.amount}`}
            className="btn-pill w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 text-sm cursor-pointer py-3"
          >
            <CreditCard className="size-4" />
            Thử thanh toán lại
          </Link>
        </div>
      )}
    </div>
  );
}

