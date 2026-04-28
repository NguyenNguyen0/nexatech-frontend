'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  CreditCard,
  ChevronRight,
  Receipt,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Users,
  Landmark,
  Smartphone,
  Banknote,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAdminPayments, getPaymentErrorMessage } from '@/lib/paymentApi';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/format';
import type { Payment } from '@/types/payment';
import { PaymentStatus, PAYMENT_METHOD_LABELS } from '@/types/payment';
import { PaymentStatusBadge } from '@/components/custom/payment/status-badge';
import type { PageResponse } from '@/types/api';

const PAGE_SIZE = 15;

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

export function AdminPaymentList() {
  const [activeStatus, setActiveStatus] = useState<PaymentStatus | null>(null);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<Payment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminPayments(page, PAGE_SIZE, activeStatus ?? undefined);
      setData(result);
    } catch (err) {
      toast.error(getPaymentErrorMessage(err, 'Không thể tải danh sách thanh toán'));
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

  const totalRevenue = data?.content
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const initialLoading = loading && !data;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản trị thanh toán</h1>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary">ADMIN</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Quản lý tất cả giao dịch trong hệ thống</p>
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
            href="/payment/admin/stats"
            className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 text-sm cursor-pointer"
          >
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Thống kê</span>
          </Link>
        </div>
      </div>

      {/* Quick stats */}
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
          <p className="text-2xl font-bold text-green-600">
            {data?.content.filter((p) => p.status === PaymentStatus.COMPLETED).length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Thành công (trang)</p>
        </div>
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="size-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {data?.content.filter((p) => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.PROCESSING).length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Đang chờ (trang)</p>
        </div>
        <div className="card-nexatech p-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
            <TrendingUp className="size-5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Doanh thu (trang)</p>
        </div>
      </div>

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
          <h2 className="text-lg font-semibold mb-2">Không có giao dịch nào</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {activeStatus ? 'Thử chọn bộ lọc khác.' : 'Chưa có giao dịch nào trong hệ thống.'}
          </p>
          {activeStatus && (
            <button
              onClick={() => handleStatusChange(null)}
              className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
            >
              Xem tất cả
            </button>
          )}
        </div>
      )}

      {/* Payment table */}
      {!loading && data && data.content.length > 0 && (
        <>
          <div className="card-nexatech overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Phương thức</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Mã GD</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Trạng thái</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground">Số tiền</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground">Thời gian</th>
                    <th className="w-10 px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.content.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                            {METHOD_ICONS[payment.method] ?? <CreditCard className="size-4 text-muted-foreground" />}
                          </div>
                          <span className="font-medium text-sm">{PAYMENT_METHOD_LABELS[payment.method] || payment.method}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {payment.transactionId ? (
                          <span className="font-mono text-xs bg-secondary px-2 py-1 rounded-lg">
                            {payment.transactionId.slice(0, 16)}{payment.transactionId.length > 16 ? '…' : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-semibold ${payment.status === PaymentStatus.COMPLETED ? 'text-green-600' : payment.status === PaymentStatus.FAILED ? 'text-red-500' : ''}`}>
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-muted-foreground text-xs">
                        {formatRelativeDate(payment.createdAt)}
                      </td>
                      <td className="px-3 py-4">
                        <Link
                          href={`/payment/admin/${payment.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          <ChevronRight className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
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

      {/* Footer note */}
      <div className="flex items-center gap-2 mt-8 pt-6 border-t border-border/50">
        <Users className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Trang này chỉ dành cho quản trị viên. Mọi thao tác đều được ghi log.
        </p>
      </div>
    </div>
  );
}
