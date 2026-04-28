'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { getPaymentStats, getPaymentErrorMessage } from '@/lib/paymentApi';
import { formatCurrency, formatDate } from '@/lib/format';
import type { PaymentStatsResponse } from '@/types/payment';
import { PaymentStatus, PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from '@/types/payment';

function getDateRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

const RANGE_OPTIONS = [
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 },
];

function SimpleBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function AdminPaymentStats() {
  const [stats, setStats] = useState<PaymentStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const range = getDateRange(selectedDays);
      const result = await getPaymentStats(range.from, range.to);
      setStats(result);
    } catch (err) {
      toast.error(getPaymentErrorMessage(err, 'Không thể tải thống kê thanh toán'));
    } finally {
      setLoading(false);
    }
  }, [selectedDays, refreshKey]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  const maxDailyRevenue = stats?.dailyRevenue
    ? Math.max(...stats.dailyRevenue.map((d) => d.revenue), 1)
    : 1;

  const maxStatusCount = stats?.byStatus
    ? Math.max(...Object.values(stats.byStatus), 1)
    : 1;

  const maxMethodCount = stats?.byMethod
    ? Math.max(...Object.values(stats.byMethod), 1)
    : 1;

  const STATUS_COLORS: Record<string, string> = {
    [PaymentStatus.COMPLETED]: 'bg-green-500',
    [PaymentStatus.PENDING]: 'bg-amber-400',
    [PaymentStatus.PROCESSING]: 'bg-blue-500',
    [PaymentStatus.FAILED]: 'bg-red-500',
    [PaymentStatus.REFUNDED]: 'bg-indigo-500',
    [PaymentStatus.CANCELLED]: 'bg-gray-400',
  };

  const METHOD_COLORS: Record<string, string> = {
    VNPAY: 'bg-blue-500',
    MOMO: 'bg-pink-500',
    COD: 'bg-amber-500',
    BANK_TRANSFER: 'bg-emerald-500',
    CREDIT_CARD: 'bg-purple-500',
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <Link
        href="/payment/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        Danh sách thanh toán
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Thống kê thanh toán</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tổng quan doanh thu và giao dịch
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                onClick={() => { setSelectedDays(opt.days); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  selectedDays === opt.days
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 text-sm cursor-pointer"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && stats && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {stats && !loading && (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="card-nexatech p-5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Receipt className="size-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{stats.totalPayments.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tổng giao dịch</p>
            </div>
            <div className="card-nexatech p-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                <DollarSign className="size-5 text-emerald-600" />
              </div>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tổng doanh thu</p>
            </div>
            <div className="card-nexatech p-5">
              <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats.byStatus[PaymentStatus.COMPLETED] ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Thành công</p>
            </div>
            <div className="card-nexatech p-5">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                <XCircle className="size-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">
                {stats.byStatus[PaymentStatus.FAILED] ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Thất bại</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* By Status */}
            <div className="card-nexatech p-6">
              <h2 className="font-semibold text-base mb-5 flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Theo trạng thái
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.byStatus)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const config = PAYMENT_STATUS_CONFIG[status as PaymentStatus];
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-medium ${config?.color ?? 'text-muted-foreground'}`}>
                            {config?.label ?? status}
                          </span>
                          <span className="text-sm font-semibold">{count.toLocaleString('vi-VN')}</span>
                        </div>
                        <SimpleBar
                          value={count}
                          max={maxStatusCount}
                          color={STATUS_COLORS[status] ?? 'bg-primary'}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* By Method */}
            <div className="card-nexatech p-6">
              <h2 className="font-semibold text-base mb-5 flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground" />
                Theo phương thức
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.byMethod)
                  .sort(([, a], [, b]) => b - a)
                  .map(([method, count]) => (
                    <div key={method}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[method] ?? method}
                        </span>
                        <span className="text-sm font-semibold">{count.toLocaleString('vi-VN')}</span>
                      </div>
                      <SimpleBar
                        value={count}
                        max={maxMethodCount}
                        color={METHOD_COLORS[method] ?? 'bg-primary'}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          {stats.dailyRevenue && stats.dailyRevenue.length > 0 && (
            <div className="card-nexatech p-6">
              <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                Doanh thu theo ngày
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                {stats.from && stats.to ? `${stats.from} — ${stats.to}` : `${selectedDays} ngày gần nhất`}
              </p>

              {/* Bar chart */}
              <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                {stats.dailyRevenue.map((d) => {
                  const height = maxDailyRevenue > 0 ? Math.max(4, Math.round((d.revenue / maxDailyRevenue) * 100)) : 4;
                  return (
                    <div
                      key={d.date}
                      className="flex flex-col items-center gap-1 shrink-0"
                      style={{ minWidth: `${Math.max(24, Math.floor(280 / stats.dailyRevenue.length))}px` }}
                    >
                      <div
                        title={`${d.date}: ${formatCurrency(d.revenue)} (${d.count} GD)`}
                        className="w-full bg-primary/70 hover:bg-primary rounded-t-lg transition-colors cursor-default"
                        style={{ height: `${height}%` }}
                      />
                      {stats.dailyRevenue.length <= 14 && (
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                          {new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Revenue table (compact) */}
              <div className="mt-6 divide-y divide-border/50 max-h-60 overflow-y-auto">
                {[...stats.dailyRevenue].reverse().map((d) => (
                  <div key={d.date} className="flex items-center justify-between py-2.5">
                    <span className="text-xs text-muted-foreground">{d.date}</span>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-xs text-muted-foreground">{d.count} GD</span>
                      <span className="text-sm font-semibold text-primary">{formatCurrency(d.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date range note */}
          <p className="text-xs text-muted-foreground mt-6 text-center">
            Dữ liệu từ {getDateRange(selectedDays).from} đến {getDateRange(selectedDays).to}
          </p>
        </>
      )}
    </div>
  );
}
