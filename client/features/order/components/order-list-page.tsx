'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCcw,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { getMyOrders } from '@/features/order/services/order-api';
import { formatCurrency } from '@/lib/utils';
import type { OrderResponse, OrderStatus, PageResponse } from '@/types/order';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  PENDING:    { label: 'Chờ xác nhận', color: 'text-yellow-700', bg: 'bg-yellow-50',  Icon: Clock },
  CONFIRMED:  { label: 'Đã xác nhận',  color: 'text-blue-700',   bg: 'bg-blue-50',    Icon: CheckCircle2 },
  PROCESSING: { label: 'Đang xử lý',   color: 'text-indigo-700', bg: 'bg-indigo-50',  Icon: Loader2 },
  SHIPPED:    { label: 'Đang giao',    color: 'text-sky-700',    bg: 'bg-sky-50',     Icon: Truck },
  DELIVERED:  { label: 'Đã giao',      color: 'text-emerald-700',bg: 'bg-emerald-50', Icon: CheckCircle2 },
  COMPLETED:  { label: 'Hoàn thành',   color: 'text-green-700',  bg: 'bg-green-50',   Icon: CheckCircle2 },
  CANCELLED:  { label: 'Đã huỷ',       color: 'text-red-700',    bg: 'bg-red-50',     Icon: XCircle },
  RETURNED:   { label: 'Trả hàng',     color: 'text-orange-700', bg: 'bg-orange-50',  Icon: RotateCcw },
  REFUNDED:   { label: 'Đã hoàn tiền', color: 'text-purple-700', bg: 'bg-purple-50',  Icon: RotateCcw },
};

const TABS: Array<{ key: OrderStatus | 'ALL'; label: string }> = [
  { key: 'ALL',       label: 'Tất cả' },
  { key: 'PENDING',   label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'SHIPPED',   label: 'Đang giao' },
  { key: 'DELIVERED', label: 'Đã giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã huỷ' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrderListPage() {
  const [data, setData] = useState<PageResponse<OrderResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const fetchOrders = useCallback(async (tab: OrderStatus | 'ALL', p: number) => {
    setLoading(true);
    try {
      const result = await getMyOrders({ page: p, size: 10 });
      setData(result);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(activeTab, page);
  }, [fetchOrders, activeTab, page]);

  const orders = data?.content ?? [];

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === 'ALL' || o.status === activeTab;
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.items ?? []).some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  return (
    <div className="flex-grow bg-surface-container-low py-8 min-h-[70vh]">
      <div className="max-w-[960px] mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Package className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Đơn hàng của tôi</h1>
            <p className="text-sm text-on-surface-variant">Tra cứu và theo dõi tất cả đơn hàng</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, tên sản phẩm..."
            className="w-full pl-11 pr-4 py-3 border border-outline-variant rounded-xl text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(0); }}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === tab.key
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container border border-outline-variant'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
            <Package className="size-16 opacity-20" />
            <p className="text-base font-medium">Không có đơn hàng nào</p>
            <Link href="/product" className="mt-2 h-10 px-5 bg-primary text-on-primary rounded-xl text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary/90 transition-colors">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => {
              const sc = STATUS_CONFIG[order.status];
              const StatusIcon = sc.Icon;
              return (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="bg-surface rounded-xl border border-outline-variant p-5 flex items-center justify-between gap-4 hover:border-primary hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.bg}`}>
                      <StatusIcon className={`size-5 ${sc.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-on-surface">#{order.orderNumber}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        {' · '}
                        {(order.items ?? []).length} sản phẩm
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-primary text-sm">{formatCurrency(order.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="h-9 px-4 rounded-lg border border-outline-variant text-sm font-medium hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <span className="h-9 px-4 flex items-center text-sm text-on-surface-variant">
              Trang {page + 1} / {data.totalPages}
            </span>
            <button
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 px-4 rounded-lg border border-outline-variant text-sm font-medium hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
