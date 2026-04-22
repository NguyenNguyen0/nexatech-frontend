'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Package, ChevronRight, ShoppingBag, ArrowRight, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { getMyOrders, getApiErrorMessage } from '@/lib/orderApi';
import { formatCurrency } from '@/lib/format';
import { formatRelativeDate } from '@/lib/format';
import type { Order, PageResponse } from '@/types/order';
import { ORDER_STATUS_CONFIG } from '@/types/order';

export default function OrdersPage() {
  const [orders, setOrders] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyOrders(page, 10);
      setOrders(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể tải danh sách đơn hàng'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading && !orders) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Package className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Đơn hàng của tôi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {orders?.totalElements ?? 0} đơn hàng
            </p>
          </div>
        </div>
        <Link
          href="/orders/payments"
          className="btn-pill bg-secondary text-foreground hover:bg-secondary/80 flex items-center gap-2 text-sm cursor-pointer"
        >
          <Wallet className="size-4" />
          <span className="hidden sm:inline">Lịch sử thanh toán</span>
        </Link>
      </div>

      {/* Order List */}
      {!orders || orders.content.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
            <ShoppingBag className="size-10 text-muted-foreground/60" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Chưa có đơn hàng</h2>
          <p className="text-muted-foreground text-sm text-center max-w-sm mb-8">
            Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
          </p>
          <Link
            href="http://localhost:3001/products"
            className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          >
            Mua sắm ngay
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.content.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="card-nexatech p-5 sm:p-6 flex items-center gap-4 group cursor-pointer"
              >
                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-semibold text-sm font-mono">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{order.items.length} sản phẩm</span>
                    <span>•</span>
                    <span>{formatRelativeDate(order.createdAt)}</span>
                  </div>

                  {/* Item names preview */}
                  <p className="text-xs text-muted-foreground mt-1.5 truncate">
                    {order.items.map((i) => i.productName).join(', ')}
                  </p>
                </div>

                {/* Price & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-base">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}

          {/* Pagination */}
          {orders.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={orders.first || loading}
                className="btn-pill bg-secondary text-foreground text-sm px-5 py-2.5 disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-sm text-muted-foreground">
                Trang {orders.number + 1} / {orders.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={orders.last || loading}
                className="btn-pill bg-secondary text-foreground text-sm px-5 py-2.5 disabled:opacity-40"
              >
                Tiếp
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
