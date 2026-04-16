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
} from 'lucide-react';
import { toast } from 'sonner';
import { getPaymentById, getPaymentErrorMessage } from '@/lib/paymentApi';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Payment } from '@/types/payment';
import { PaymentStatus, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_CONFIG } from '@/types/payment';
import { PaymentStatusBadge } from '@/components/custom/payment/status-badge';

const STATUS_ICONS: Record<PaymentStatus, React.ReactNode> = {
  [PaymentStatus.PENDING]: <Clock className="size-5 text-amber-600" />,
  [PaymentStatus.PROCESSING]: <Loader2 className="size-5 text-blue-600 animate-spin" />,
  [PaymentStatus.COMPLETED]: <CheckCircle className="size-5 text-green-600" />,
  [PaymentStatus.FAILED]: <XCircle className="size-5 text-red-500" />,
  [PaymentStatus.REFUNDED]: <Receipt className="size-5 text-indigo-600" />,
  [PaymentStatus.CANCELLED]: <XCircle className="size-5 text-gray-500" />,
};

interface PaymentDetailViewProps {
  paymentId: string;
}

export function PaymentDetailView({ paymentId }: PaymentDetailViewProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

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

  const copyTransactionId = () => {
    if (payment?.transactionId) {
      navigator.clipboard.writeText(payment.transactionId);
      toast.success('Đã sao chép mã giao dịch');
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

      {/* Details */}
      <div className="card-nexatech p-6 space-y-5">
        <h2 className="font-semibold text-lg">Chi tiết giao dịch</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Phương thức</span>
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <span className="font-medium text-sm">
                {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <PaymentStatusBadge status={payment.status} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Số tiền</span>
            <span className="font-bold text-primary">{formatCurrency(payment.amount)}</span>
          </div>

          {payment.transactionId && (
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Mã giao dịch</span>
              <button
                onClick={copyTransactionId}
                className="flex items-center gap-1.5 font-mono text-xs bg-secondary px-3 py-1.5 rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                {payment.transactionId}
                <Copy className="size-3" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Thời gian</span>
            <span className="text-sm">{formatDate(payment.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Đơn hàng</span>
            <Link
              href={`/orders/${payment.orderId}`}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium cursor-pointer"
            >
              <Package className="size-4" />
              Xem đơn hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
