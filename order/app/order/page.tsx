'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Loader2,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ArrowRight,
  Wallet,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import { getMyOrders, getApiErrorMessage } from '@/lib/orderApi';
import { formatCurrency } from '@/lib/format';
import type { Order } from '@/types/order';
import { OrderStatus, ORDER_STATUS_CONFIG } from '@/types/order';

const STAT_ICONS: Record<string, React.ReactNode> = {
  total: <Package className="size-5" />,
  pending: <Clock className="size-5" />,
  shipping: <Truck className="size-5" />,
  delivered: <CheckCircle className="size-5" />,
  cancelled: <XCircle className="size-5" />,
};

export default function OrderOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const result = await getMyOrders(0, 100);
      setOrders(result.content);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không tải được dữ liệu'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  const pendingCount = orders.filter(
    (o) => o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED,
  ).length;
  const shippingCount = orders.filter(
    (o) => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.SHIPPED,
  ).length;
  const deliveredCount = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
  const cancelledCount = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;
  const totalSpent = orders
    .filter((o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REFUNDED)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { key: 'total', label: 'Tổng đơn', value: orders.length, color: 'text-primary', bg: 'bg-primary/10' },
    { key: 'pending', label: 'Chờ xử lý', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
    { key: 'shipping', label: 'Đang giao', value: shippingCount, color: 'text-purple-600', bg: 'bg-purple-50' },
    { key: 'delivered', label: 'Đã giao', value: deliveredCount, color: 'text-green-600', bg: 'bg-green-50' },
    { key: 'cancelled', label: 'Đã hủy', value: cancelledCount, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng chi tiêu: <span className="font-semibold text-primary">{formatCurrency(totalSpent)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/orders/payments"
            className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 flex items-center gap-2 text-sm cursor-pointer"
          >
            <Wallet className="size-4" />
            <span className="hidden sm:inline">Thanh toán</span>
          </Link>
          <Link
            href="/orders"
            className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 text-sm cursor-pointer"
          >
            <Package className="size-4" />
            <span className="hidden sm:inline">Tất cả đơn</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.key} className="card-nexatech p-5">
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center mb-3 ${stat.color}`}>
              {STAT_ICONS[stat.key]}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card-nexatech p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg">Đơn hàng gần đây</h2>
          <Link
            href="/orders"
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
          >
            Xem tất cả
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="size-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Bạn chưa có đơn hàng nào</p>
            <Link
              href="/"
              className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 text-sm cursor-pointer"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => {
              const config = ORDER_STATUS_CONFIG[order.status];
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Package className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium font-mono">{order.orderNumber}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {order.items.map((i) => i.productName).join(', ')}
                    </p>
                  </div>
                  <p className="font-semibold text-sm shrink-0">{formatCurrency(order.totalAmount)}</p>
                  <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Link href="/orders/payments" className="card-nexatech p-5 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
            <Wallet className="size-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Lịch sử thanh toán</p>
            <p className="text-xs text-muted-foreground mt-0.5">Xem tất cả giao dịch thanh toán</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-indigo-600 transition-colors" />
        </Link>
        <Link href="/cart" className="card-nexatech p-5 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <ShoppingBag className="size-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Giỏ hàng</p>
            <p className="text-xs text-muted-foreground mt-0.5">Xem và quản lý giỏ hàng của bạn</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}