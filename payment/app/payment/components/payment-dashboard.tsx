'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  CreditCard,
  ChevronRight,
  Receipt,
  Wallet,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { getMyPayments, getPaymentErrorMessage } from '@/lib/paymentApi';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/format';
import type { Payment, PaymentStatus } from '@/types/payment';
import { PAYMENT_METHOD_LABELS } from '@/types/payment';
import { PaymentStatusBadge } from '@/components/custom/payment/status-badge';
import type { PageResponse } from '@/types/api';

const PAGE_SIZE = 10;

export function PaymentDashboard() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<Payment> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyPayments(page, PAGE_SIZE);
      setData(result);
    } catch (err) {
      toast.error(getPaymentErrorMessage(err, 'Không thể tải lịch sử thanh toán'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải lịch sử thanh toán...</p>
        </div>
      </div>
    );
  }

  const completedCount = data?.content.filter((p) => p.status === 'COMPLETED').length ?? 0;
  const pendingCount = data?.content.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING').length ?? 0;
  const failedCount = data?.content.filter((p) => p.status === 'FAILED').length ?? 0;
  const totalAmount = data?.content
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wallet className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Thanh toán</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quản lý giao dịch thanh toán của bạn
            </p>
          </div>
        </div>
        <Link
          href="/payment/initiate"
          className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 text-sm cursor-pointer"
        >
          <CreditCard className="size-4" />
          <span className="hidden sm:inline">Thanh toán mới</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Receipt className="size-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{data?.totalElements ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tổng giao dịch</p>
        </div>
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
            <CheckCircle className="size-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">{completedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Thành công</p>
        </div>
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="size-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Đang chờ</p>
        </div>
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
            <XCircle className="size-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold">{failedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Thất bại</p>
        </div>
      </div>

      {/* Total spent */}
      {totalAmount > 0 && (
        <div className="card-nexatech p-5 mb-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Tổng đã thanh toán</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
        </div>
      )}

      {/* Empty */}
      {data && data.content.length === 0 && (
        <div className="card-nexatech p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
            <Receipt className="size-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Chưa có giao dịch nào</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Lịch sử thanh toán sẽ hiển thị ở đây sau khi bạn thực hiện đơn hàng.
          </p>
          <Link
            href="/"
            className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Mua sắm ngay
          </Link>
        </div>
      )}

      {/* Payment List */}
      {data && data.content.length > 0 && (
        <>
          <div className="space-y-3">
            {data.content.map((payment) => (
              <Link
                key={payment.id}
                href={`/payment/${payment.id}`}
                className="card-nexatech p-5 flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <CreditCard className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">
                      {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                    </p>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {payment.transactionId && (
                      <>
                        <span className="font-mono">{payment.transactionId}</span>
                        <span className="text-border">·</span>
                      </>
                    )}
                    <span>{formatRelativeDate(payment.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">{formatCurrency(payment.amount)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={data.first}
                className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:pointer-events-none text-sm cursor-pointer"
              >
                Trước
              </button>
              <span className="text-sm text-muted-foreground px-3">
                {data.number + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.last}
                className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:pointer-events-none text-sm cursor-pointer"
              >
                Tiếp
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
