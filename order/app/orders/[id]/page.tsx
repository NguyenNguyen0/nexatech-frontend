'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  Truck,
  CreditCard,
  Clock,
  XCircle,
  CheckCircle,
  CircleDot,
  Copy,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { getOrderById, cancelOrder, getApiErrorMessage } from '@/lib/orderApi';
import { getPaymentByOrderId } from '@/lib/paymentApi';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Order } from '@/types/order';
import { OrderStatus, ORDER_STATUS_CONFIG } from '@/types/order';
import type { Payment } from '@/types/payment';
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from '@/types/payment';

const STATUS_TIMELINE = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  [OrderStatus.PENDING]: <Clock className="size-4" />,
  [OrderStatus.CONFIRMED]: <CheckCircle className="size-4" />,
  [OrderStatus.PROCESSING]: <Package className="size-4" />,
  [OrderStatus.SHIPPED]: <Truck className="size-4" />,
  [OrderStatus.DELIVERED]: <CheckCircle className="size-4" />,
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);

      // Fetch payment info (non-blocking — COD orders may not have payment yet)
      try {
        const paymentData = await getPaymentByOrderId(orderId);
        setPayment(paymentData);
      } catch {
        // Payment not found is expected for some order states
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không tìm thấy đơn hàng'));
      router.replace('/orders');
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(orderId);
      setOrder(updated);
      toast.success('Đã hủy đơn hàng thành công');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Hủy đơn hàng thất bại'));
    } finally {
      setCancelling(false);
    }
  };

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      toast.success('Đã sao chép mã đơn hàng');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const canCancel = order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;
  const isCancelled = order.status === OrderStatus.CANCELLED;
  const currentStatusIndex = STATUS_TIMELINE.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        Quay lại danh sách đơn
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Đơn hàng
            </h1>
            <button
              onClick={copyOrderNumber}
              className="flex items-center gap-1.5 text-primary font-mono text-lg hover:bg-primary/5 px-2 py-1 rounded-xl transition-colors"
            >
              {order.orderNumber}
              <Copy className="size-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Đặt lúc {formatDate(order.createdAt)}
          </p>
        </div>

        <span
          className={`self-start text-sm font-medium px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="card-nexatech p-6 mb-6">
          <h2 className="font-semibold text-sm mb-5 text-muted-foreground uppercase tracking-wider">
            Trạng thái đơn hàng
          </h2>
          <div className="flex items-center justify-between relative">
            {/* Progress bar background */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
            {/* Progress bar filled */}
            {currentStatusIndex > 0 && (
              <div
                className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
                style={{
                  width: `${(currentStatusIndex / (STATUS_TIMELINE.length - 1)) * 100}%`,
                }}
              />
            )}

            {STATUS_TIMELINE.map((status, idx) => {
              const isActive = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              const config = ORDER_STATUS_CONFIG[status];
              return (
                <div key={status} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110'
                        : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground border border-border'
                    }`}
                  >
                    {isActive ? (
                      TIMELINE_ICONS[status]
                    ) : (
                      <CircleDot className="size-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs mt-2 text-center whitespace-nowrap ${
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card-nexatech p-6">
            <h2 className="font-semibold text-lg mb-4">
              Sản phẩm ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0"
                >
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                    <Package className="size-6 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm shrink-0">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="card-nexatech p-6 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Địa chỉ giao hàng</p>
                <p className="text-sm font-medium mt-0.5">{order.shippingAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="size-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Vận chuyển</p>
                <p className="text-sm font-medium mt-0.5">
                  {order.shippingMethod === 'EXPRESS' ? 'Nhanh (1-2 ngày)' : 'Tiêu chuẩn (3-5 ngày)'}
                </p>
                {order.trackingNumber && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Mã vận đơn: <span className="font-mono">{order.trackingNumber}</span>
                    {order.carrierName && ` — ${order.carrierName}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="size-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Thanh toán</p>
                <p className="text-sm font-medium mt-0.5">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                </p>
              </div>
            </div>
            {order.note && (
              <div className="flex items-start gap-3">
                <FileText className="size-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Ghi chú</p>
                  <p className="text-sm mt-0.5">{order.note}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Status */}
          {payment && (
            <div className="card-nexatech p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Thanh toán</h2>
                {(() => {
                  const pConfig = PAYMENT_STATUS_CONFIG[payment.status];
                  return (
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${pConfig.bgColor} ${pConfig.color}`}>
                      {pConfig.label}
                    </span>
                  );
                })()}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức</span>
                  <span className="font-medium">
                    {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tiền</span>
                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                </div>
                {payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã giao dịch</span>
                    <span className="font-mono text-xs bg-secondary px-2 py-1 rounded-lg">
                      {payment.transactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian</span>
                  <span>{formatDate(payment.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div>
          <div className="card-nexatech p-6 sticky top-6">
            <h2 className="font-semibold text-lg mb-5">Tổng đơn hàng</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatCurrency(order.totalAmount - (order.shippingFee ?? 0) + (order.discount ?? 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span>
                  {order.shippingFee === 0 ? (
                    <span className="text-green-600">Miễn phí</span>
                  ) : (
                    formatCurrency(order.shippingFee ?? 0)
                  )}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giảm giá</span>
                  <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border/50 mt-4 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Cancel button */}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-pill w-full mt-5 bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center gap-2 text-sm"
              >
                {cancelling ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
