'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  CreditCard,
  ChevronRight,
  Receipt,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Landmark,
  Smartphone,
  Banknote,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getMyPayments, getPaymentErrorMessage } from '@/lib/paymentApi';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/format';
import type { Payment } from '@/types/payment';
import { PaymentStatus, PAYMENT_METHOD_LABELS } from '@/types/payment';
import { PaymentStatusBadge } from '@/components/custom/payment/status-badge';
import type { PageResponse } from '@/types/api';

const PAGE_SIZE = 10;

const STATUS_TABS: { value: PaymentStatus | null; label: string; icon: React.ReactNode }[] = [
  { value: null, label: 'Tất cả', icon: <Receipt className="size-3.5" /> },
  { value: PaymentStatus.PENDING, label: 'Chờ TT', icon: <Clock className="size-3.5 text-amber-600" /> },
  { value: PaymentStatus.PROCESSING, label: 'Đang xử lý', icon: <Loader2 className="size-3.5 text-blue-600" /> },
  { value: PaymentStatus.COMPLETED, label: 'Thành công', icon: <CheckCircle className="size-3.5 text-green-600" /> },
  { value: PaymentStatus.FAILED, label: 'Thất bại', icon: <XCircle className="size-3.5 text-red-500" /> },
  { value: PaymentStatus.REFUNDED, label: 'Hoàn tiền', icon: <TrendingUp className="size-3.5 text-indigo-600" /> },
  { value: PaymentStatus.CANCELLED, label: 'Đã hủy', icon: <AlertCircle className="size-3.5 text-gray-500" /> },
];

const METHOD_ICONS: Record<string, React.ReactNode> = {
  VNPAY: <Landmark className="size-5 text-blue-600" />,
  MOMO: <Smartphone className="size-5 text-pink-600" />,
  COD: <Banknote className="size-5 text-green-600" />,
  BANK_TRANSFER: <Building2 className="size-5 text-indigo-600" />,
  CREDIT_CARD: <CreditCard className="size-5 text-purple-600" />,
};

export function PaymentDashboard() {
  const [activeStatus, setActiveStatus] = useState<PaymentStatus | null>(null);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<Payment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyPayments(page, PAGE_SIZE, activeStatus ?? undefined);
      setData(result);
    } catch (err) {
      toast.error(getPaymentErrorMessage(err, 'Không thể tải lịch sử thanh toán'));
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus, refreshKey]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatusChange = (status: PaymentStatus | null) => {
    if (status === activeStatus) return;
    setPage(0);
    setActiveStatus(status);
  };

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  const totalAmount = data?.content
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const completedCount = activeStatus === null
    ? data?.content.filter((p) => p.status === PaymentStatus.COMPLETED).length ?? 0
    : activeStatus === PaymentStatus.COMPLETED ? data?.totalElements ?? 0 : 0;

  const pendingCount = activeStatus === null
    ? data?.content.filter((p) => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.PROCESSING).length ?? 0
    : (activeStatus === PaymentStatus.PENDING || activeStatus === PaymentStatus.PROCESSING) ? data?.totalElements ?? 0 : 0;

  const failedCount = activeStatus === null
    ? data?.content.filter((p) => p.status === PaymentStatus.FAILED).length ?? 0
    : activeStatus === PaymentStatus.FAILED ? data?.totalElements ?? 0 : 0;

  const initialLoading = loading && !data;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải lịch sử thanh toán...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 text-sm cursor-pointer"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <Link
            href="/payment/initiate"
            className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 text-sm cursor-pointer"
          >
            <CreditCard className="size-4" />
            <span className="hidden sm:inline">Thanh toán mới</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Receipt className="size-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{data?.totalElements ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeStatus ? STATUS_TABS.find((t) => t.value === activeStatus)?.label : 'Tổng giao dịch'}
          </p>
        </div>
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
            <CheckCircle className="size-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Thành công</p>
        </div>
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="size-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Đang chờ</p>
        </div>
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
            <XCircle className="size-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">{failedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Thất bại</p>
        </div>
      </div>

      {/* Total spent banner */}
      {totalAmount > 0 && activeStatus === null && (
        <div className="card-nexatech p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <p className="text-sm text-muted-foreground">Tổng đã thanh toán thành công (trang này)</p>
          </div>
          <p className="text-lg font-bold text-primary">{formatCurrency(totalAmount)}</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value ?? 'all'}
            onClick={() => handleStatusChange(tab.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
              activeStatus === tab.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading overlay on filter change */}
      {loading && data && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && data && data.content.length === 0 && (
        <div className="card-nexatech p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
            <Receipt className="size-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            {activeStatus ? `Không có giao dịch ${STATUS_TABS.find((t) => t.value === activeStatus)?.label.toLowerCase()}` : 'Chưa có giao dịch nào'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {activeStatus
              ? 'Thử chọn bộ lọc khác hoặc xem tất cả giao dịch.'
              : 'Lịch sử thanh toán sẽ hiển thị ở đây sau khi bạn thực hiện đơn hàng.'}
          </p>
          {activeStatus ? (
            <button
              onClick={() => handleStatusChange(null)}
              className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
            >
              Xem tất cả
            </button>
          ) : (
            <Link
              href="/"
              className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Mua sắm ngay
            </Link>
          )}
        </div>
      )}

      {/* Payment List */}
      {!loading && data && data.content.length > 0 && (
        <>
          <div className="space-y-3">
            {data.content.map((payment) => (
              <Link
                key={payment.id}
                href={`/payment/${payment.id}`}
                className="card-nexatech p-5 flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  {METHOD_ICONS[payment.method] ?? <CreditCard className="size-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-sm">
                      {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                    </p>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {payment.transactionId && (
                      <>
                        <span className="font-mono truncate max-w-30">{payment.transactionId}</span>
                        <span className="text-border">·</span>
                      </>
                    )}
                    <span>{formatRelativeDate(payment.createdAt)}</span>
                  </div>
                  {payment.failureReason && (
                    <p className="text-xs text-red-500 mt-1 truncate">{payment.failureReason}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold text-sm ${payment.status === PaymentStatus.COMPLETED ? 'text-green-600' : payment.status === PaymentStatus.FAILED ? 'text-red-500' : ''}`}>
                    {formatCurrency(payment.amount)}
                  </p>
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
                disabled={page === 0}
                className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:pointer-events-none text-sm cursor-pointer"
              >
                Trước
              </button>
              <span className="text-sm text-muted-foreground px-3">
                {data.page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
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

