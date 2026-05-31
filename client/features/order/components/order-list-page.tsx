'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ElementType, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  Loader2,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getMyOrders } from '@/features/order/services/order-api';
import { formatCurrency } from '@/lib/utils';
import type { OrderResponse, OrderStatus, PageResponse } from '@/types/order';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; iconClassName: string; Icon: ElementType }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    iconClassName: 'bg-amber-100 text-amber-700',
    Icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    iconClassName: 'bg-blue-100 text-blue-700',
    Icon: CheckCircle2,
  },
  PROCESSING: {
    label: 'Đang xử lý',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    iconClassName: 'bg-indigo-100 text-indigo-700',
    Icon: Loader2,
  },
  SHIPPED: {
    label: 'Đang giao',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
    iconClassName: 'bg-sky-100 text-sky-700',
    Icon: Truck,
  },
  DELIVERED: {
    label: 'Đã giao',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    iconClassName: 'bg-emerald-100 text-emerald-700',
    Icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    className: 'border-green-200 bg-green-50 text-green-700',
    iconClassName: 'bg-green-100 text-green-700',
    Icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'border-red-200 bg-red-50 text-red-700',
    iconClassName: 'bg-red-100 text-red-700',
    Icon: XCircle,
  },
  OUT_OF_STOCK: {
    label: 'Tạm thời hết hàng',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    iconClassName: 'bg-amber-100 text-amber-800',
    Icon: AlertCircle,
  },
  SHIPPING_FAILED: {
    label: 'Tạo đơn giao thất bại',
    className: 'border-red-200 bg-red-50 text-red-700',
    iconClassName: 'bg-red-100 text-red-700',
    Icon: XCircle,
  },
  REFUND_PENDING: {
    label: 'Đang xử lý hoàn tiền',
    className: 'border-purple-200 bg-purple-50 text-purple-700',
    iconClassName: 'bg-purple-100 text-purple-700',
    Icon: RotateCcw,
  },
  RETURNED: {
    label: 'Trả hàng',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
    iconClassName: 'bg-orange-100 text-orange-700',
    Icon: RotateCcw,
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    className: 'border-purple-200 bg-purple-50 text-purple-700',
    iconClassName: 'bg-purple-100 text-purple-700',
    Icon: RotateCcw,
  },
};

const TABS: Array<{ key: OrderStatus | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'PROCESSING', label: 'Đang xử lý' },
  { key: 'SHIPPED', label: 'Đang giao' },
  { key: 'DELIVERED', label: 'Đã giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'OUT_OF_STOCK', label: 'Hết hàng' },
  { key: 'SHIPPING_FAILED', label: 'Lỗi giao hàng' },
  { key: 'REFUND_PENDING', label: 'Chờ hoàn tiền' },
];

const RECENT_GUEST_ORDERS_KEY = 'nexatech_recent_orders';

interface OrderListPageProps {
  variant?: 'standalone' | 'account';
}

type RecentGuestOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function orderItemSummary(order: OrderResponse) {
  const items = order.items ?? [];
  if (items.length === 0) return 'Không có sản phẩm';
  const first = items[0];
  const extra = items.length - 1;
  return extra > 0 ? `${first.productName} và ${extra} sản phẩm khác` : first.productName;
}

export default function OrderListPage({ variant = 'standalone' }: OrderListPageProps) {
  const router = useRouter();
  const { status } = useSession();
  const [data, setData] = useState<PageResponse<OrderResponse> | null>(null);
  const [recentGuestOrders, setRecentGuestOrders] = useState<RecentGuestOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const fetchOrders = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const result = await getMyOrders({
        page: nextPage,
        size: 10,
        sort: 'createdAt,desc',
      });
      setData(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated' && variant === 'account') {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent('/user/orders')}`);
    }
  }, [router, status, variant]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    void fetchOrders(page);
  }, [fetchOrders, page, status]);

  useEffect(() => {
    if (variant !== 'standalone' || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(RECENT_GUEST_ORDERS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as RecentGuestOrder[];
      if (Array.isArray(parsed)) {
        setRecentGuestOrders(parsed.filter((item) => item.id && item.orderNumber));
      }
    } catch {
      setRecentGuestOrders([]);
    }
  }, [variant]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (data?.content ?? []).filter((order) => {
      const matchStatus = activeTab === 'ALL' || order.status === activeTab;
      const matchSearch =
        !keyword ||
        order.orderNumber.toLowerCase().includes(keyword) ||
        (order.items ?? []).some((item) => item.productName.toLowerCase().includes(keyword));
      return matchStatus && matchSearch;
    });
  }, [activeTab, data?.content, search]);

  const isAccountView = variant === 'account';
  const isInitialLoading = status === 'loading' || (status === 'authenticated' && loading && !data);

  if (!isAccountView && status === 'unauthenticated') {
    return <GuestOrderTracking recentOrders={recentGuestOrders} />;
  }

  return (
    <div className={isAccountView ? 'space-y-5' : 'min-h-[70vh] bg-surface-container-low py-8'}>
      <div className={isAccountView ? 'space-y-5' : 'mx-auto max-w-[960px] px-4'}>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-md border border-border bg-bg-elevated p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Lịch sử đơn hàng</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Theo dõi trạng thái, thanh toán và chi tiết các đơn đã đặt.
              </p>
            </div>
          </div>
          {data && (
            <span className="rounded-full border border-border bg-bg-base px-3 py-1 text-xs font-semibold text-text-secondary">
              {data.totalElements} đơn hàng
            </span>
          )}
        </div>

        <section className="rounded-md border border-border bg-bg-elevated p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo mã đơn hoặc tên sản phẩm"
              className="h-10 w-full rounded-md border border-border bg-bg-base pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-primary"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(0);
                }}
                className={[
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  activeTab === tab.key
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-bg-base text-text-secondary hover:border-primary hover:text-primary',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {isInitialLoading ? (
          <div className="flex items-center justify-center rounded-md border border-border bg-bg-elevated py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-bg-elevated px-6 py-16 text-center">
            <Package className="h-14 w-14 text-text-tertiary/50" />
            <h2 className="mt-4 text-base font-semibold text-text-primary">Chưa có đơn hàng phù hợp</h2>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              Các đơn hàng sau khi đặt thành công sẽ xuất hiện tại đây để bạn tiện theo dõi.
            </p>
            <Link
              href="/product"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status];
              const StatusIcon = statusConfig.Icon;

              return (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="group block rounded-md border border-border bg-bg-elevated p-4 shadow-sm transition hover:border-primary hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${statusConfig.iconClassName}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-text-primary">#{order.orderNumber}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusConfig.className}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-text-secondary">{orderItemSummary(order)}</p>
                        <p className="mt-1 text-xs text-text-tertiary">
                          {formatDate(order.createdAt)} · {(order.items ?? []).length} sản phẩm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-text-tertiary">Tổng thanh toán</p>
                        <p className="mt-0.5 font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-bg-elevated px-3 text-sm font-medium text-text-secondary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </button>
            <span className="px-3 text-sm text-text-secondary">
              Trang {page + 1} / {data.totalPages}
            </span>
            <button
              type="button"
              disabled={data.last || loading}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-bg-elevated px-3 text-sm font-medium text-text-secondary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GuestOrderTracking({ recentOrders }: { recentOrders: RecentGuestOrder[] }) {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = orderId.trim();
    if (!value) return;
    router.push(`/order/${value}`);
  };

  return (
    <div className="min-h-[70vh] bg-surface-container-low py-8">
      <div className="mx-auto max-w-[760px] px-4">
        <section className="rounded-md border border-border bg-bg-elevated p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Theo dõi đơn hàng</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Nhập mã orderId hoặc mở lại đơn vừa đặt để xem trạng thái xử lý và vận chuyển.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Nhập orderId"
              className="h-11 flex-1 rounded-md border border-border bg-bg-base px-3 text-sm text-text-primary outline-none transition focus:border-primary"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Tra cứu
            </button>
          </form>
        </section>

        <section className="mt-5 rounded-md border border-border bg-bg-elevated p-5 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary">Đơn vừa đặt trên thiết bị này</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-text-secondary">
              Chưa có đơn guest nào được lưu trên trình duyệt này. Sau khi đặt hàng thành công, đơn sẽ xuất hiện tại đây.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-base px-4 py-3 transition hover:border-primary hover:text-primary"
                >
                  <div>
                    <p className="text-sm font-semibold">#{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-text-tertiary">{formatDate(order.createdAt)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
