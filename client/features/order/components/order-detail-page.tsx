'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Loader2,
  XCircle,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getOrderById, cancelOrder } from '@/features/order/services/order-api';
import { getShipmentByOrderId } from '@/features/shipping/services/shipping-api';
import { formatCurrency } from '@/lib/utils';
import type { OrderResponse, OrderStatus } from '@/types/order';
import type { TrackingResponse, ShipmentStatus } from '@/types/shipping';

// ── Status helpers ────────────────────────────────────────────────────────────

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:    'Chờ xác nhận',
  CONFIRMED:  'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED:    'Đang giao hàng',
  DELIVERED:  'Đã giao',
  COMPLETED:  'Hoàn thành',
  CANCELLED:  'Đã huỷ',
  RETURNED:   'Trả hàng',
  REFUNDED:   'Đã hoàn tiền',
};

const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:    'text-yellow-700 bg-yellow-50 border-yellow-200',
  CONFIRMED:  'text-blue-700 bg-blue-50 border-blue-200',
  PROCESSING: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  SHIPPED:    'text-sky-700 bg-sky-50 border-sky-200',
  DELIVERED:  'text-emerald-700 bg-emerald-50 border-emerald-200',
  COMPLETED:  'text-green-700 bg-green-50 border-green-200',
  CANCELLED:  'text-red-700 bg-red-50 border-red-200',
  RETURNED:   'text-orange-700 bg-orange-50 border-orange-200',
  REFUNDED:   'text-purple-700 bg-purple-50 border-purple-200',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD:           'Thanh toán khi nhận hàng (COD)',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  MOMO:          'Ví MoMo',
  VNPAY:         'VNPay',
  CREDIT_CARD:   'Thẻ tín dụng',
};

const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  PENDING_PICKUP: 'Chờ lấy hàng',
  PICKED_UP:      'Đã lấy hàng',
  IN_TRANSIT:     'Đang vận chuyển',
  DELIVERED:      'Đã giao',
  FAILED:         'Giao thất bại',
  RETURNED:       'Đã trả',
  CANCELLED:      'Đã huỷ',
};

const SHIPMENT_STATUS_ICON: Record<ShipmentStatus, React.ElementType> = {
  PENDING_PICKUP: Clock,
  PICKED_UP:      Package,
  IN_TRANSIT:     Truck,
  DELIVERED:      CheckCircle2,
  FAILED:         XCircle,
  RETURNED:       RotateCcw,
  CANCELLED:      XCircle,
};

// ── Main component ────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoadingOrder(true);
    try {
      const o = await getOrderById(id);
      setOrder(o);
      // Load tracking if shipment exists
      if (o.trackingNumber) {
        setLoadingTracking(true);
        try {
          const t = await getShipmentByOrderId(o.id);
          setTracking(t);
        } catch {
          // Tracking not critical — silently ignore
        } finally {
          setLoadingTracking(false);
        }
      }
    } catch {
      toast.error('Không thể tải thông tin đơn hàng');
      router.push('/order');
    } finally {
      setLoadingOrder(false);
    }
  }, [id, router]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm('Bạn có chắc muốn huỷ đơn hàng này?')) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      toast.success('Đã huỷ đơn hàng');
    } catch {
      toast.error('Huỷ đơn hàng thất bại. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  if (loadingOrder) {
    return (
      <div className="flex-grow flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const statusClass = ORDER_STATUS_COLOR[order.status];

  return (
    <div className="flex-grow bg-surface-container-low py-8">
      <div className="max-w-[960px] mx-auto px-4">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/order" className="hover:text-primary">Đơn hàng</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">#{order.orderNumber}</span>
        </nav>

        {/* Back + Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/order')}
              className="w-9 h-9 rounded-xl border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
            >
              <ArrowLeft className="size-4 text-on-surface-variant" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-on-surface">Đơn #{order.orderNumber}</h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${statusClass}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="h-9 px-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
              >
                {cancelling ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                Huỷ đơn
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ──────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Order items */}
            <section className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm">
              <h2 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Sản phẩm ({(order.items ?? []).length})
              </h2>
              <div className="flex flex-col divide-y divide-outline-variant">
                {(order.items ?? []).map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
                      <Package className="size-5 text-outline" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-on-surface line-clamp-2">{item.productName}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-on-surface shrink-0">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping address */}
            <section className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm">
              <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Địa chỉ giao hàng
              </h2>
              <p className="text-sm text-on-surface">{order.shippingAddress}</p>
              {order.note && (
                <p className="mt-2 text-xs text-on-surface-variant bg-surface-container rounded-lg px-3 py-2 mt-3">
                  Ghi chú: {order.note}
                </p>
              )}
            </section>

            {/* Tracking timeline */}
            {order.trackingNumber && (
              <section className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm">
                <h2 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <Truck className="size-4 text-primary" />
                  Theo dõi vận chuyển
                  {order.trackingNumber && (
                    <span className="text-xs font-normal text-on-surface-variant ml-1">
                      · Mã: {order.trackingNumber}
                    </span>
                  )}
                </h2>

                {loadingTracking ? (
                  <div className="flex items-center gap-2 py-4 text-on-surface-variant text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    Đang tải lịch sử vận chuyển...
                  </div>
                ) : tracking ? (
                  <div className="relative">
                    {/* Current status */}
                    <div className={`flex items-center gap-3 mb-5 p-3 rounded-xl border ${ORDER_STATUS_COLOR[order.status]}`}>
                      <Truck className="size-5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">
                          {SHIPMENT_STATUS_LABEL[tracking.status]}
                        </p>
                        {tracking.currentLocation?.address && (
                          <p className="text-xs mt-0.5 opacity-80">{tracking.currentLocation.address}</p>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    {(tracking.histories ?? []).length > 0 && (
                      <ol className="relative border-l-2 border-outline-variant ml-3 pl-6 flex flex-col gap-5">
                        {[...(tracking.histories ?? [])].reverse().map((h, idx) => {
                          const Icon = SHIPMENT_STATUS_ICON[h.status as ShipmentStatus] ?? Clock;
                          return (
                            <li key={idx} className="relative">
                              <div className="absolute -left-9 w-4 h-4 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
                                <Icon className="size-2.5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-on-surface">
                                  {SHIPMENT_STATUS_LABEL[h.status as ShipmentStatus] ?? h.status}
                                </p>
                                {h.locationAddress && (
                                  <p className="text-xs text-on-surface-variant mt-0.5">{h.locationAddress}</p>
                                )}
                                {h.note && (
                                  <p className="text-xs text-on-surface-variant mt-0.5 italic">{h.note}</p>
                                )}
                                <p className="text-xs text-on-surface-variant mt-1">
                                  {new Date(h.eventTime).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-4 text-on-surface-variant text-sm">
                    <AlertCircle className="size-4" />
                    Chưa có thông tin vận chuyển
                  </div>
                )}
              </section>
            )}
          </div>

          {/* ── Right column ─────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Price summary */}
            <section className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm">
              <h2 className="text-base font-semibold text-on-surface mb-4">Tóm tắt đơn hàng</h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Tạm tính</span>
                  <span className="text-on-surface font-medium">
                    {formatCurrency(order.totalAmount + order.discount - order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Phí vận chuyển</span>
                  <span className="text-on-surface font-medium">{formatCurrency(order.shippingFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Giảm giá</span>
                    <span className="font-medium">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-outline-variant flex justify-between">
                  <span className="font-semibold text-on-surface">Tổng cộng</span>
                  <span className="font-bold text-primary text-base">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </section>

            {/* Payment info */}
            <section className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm">
              <h2 className="text-base font-semibold text-on-surface mb-3">Thanh toán</h2>
              <p className="text-sm text-on-surface">
                {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
              </p>
            </section>

            {/* Delivery info */}
            {(order.carrierName || order.estimatedDelivery) && (
              <section className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm">
                <h2 className="text-base font-semibold text-on-surface mb-3">Thông tin giao hàng</h2>
                <div className="flex flex-col gap-2 text-sm">
                  {order.carrierName && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Đơn vị vận chuyển</span>
                      <span className="font-medium text-on-surface">{order.carrierName}</span>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Dự kiến giao</span>
                      <span className="font-medium text-on-surface">
                        {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Ngày gửi</span>
                      <span className="font-medium text-on-surface">
                        {new Date(order.shippedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Ngày nhận</span>
                      <span className="font-medium text-on-surface">
                        {new Date(order.deliveredAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link
                href="/order"
                className="h-10 flex items-center justify-center gap-2 border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
              >
                <ArrowLeft className="size-4" />
                Quay lại danh sách
              </Link>
              <Link
                href="/product"
                className="h-10 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
