'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getCart, clearCart } from '@/features/cart/services/cart-api';
import { checkout } from '@/features/checkout/services/checkout-api';
import type { Cart } from '@/types/cart';
import type { OrderPaymentMethod } from '@/types/order';

// Map UI radio value → backend PaymentMethod enum
const UI_TO_PAYMENT_METHOD: Record<string, OrderPaymentMethod> = {
  cod:         'COD',
  bank:        'VNPAY',        // VietQR → redirects to VNPAY sandbox
  card:        'VNPAY',
  installment: 'CREDIT_CARD',
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'card' | 'installment'>('bank');

  // Buyer contact info (required for guest orders)
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // Shipping address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [note, setNote] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const idempotencyKey = useRef(crypto.randomUUID());

  useEffect(() => {
    getCart()
      .then(setCart)
      .finally(() => setLoading(false));
  }, []);

  const handleOrder = async () => {
    if (!cart || cart.items.length === 0) return;

    // Validate buyer info
    if (!buyerName.trim()) {
      toast.error('Vui lòng nhập họ tên người đặt hàng');
      return;
    }
    if (!buyerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    // Validate shipping address
    const addressParts = [street.trim(), ward.trim(), district.trim(), city.trim()].filter(Boolean);
    if (addressParts.length < 2) {
      toast.error('Vui lòng nhập địa chỉ giao hàng đầy đủ');
      return;
    }
    const shippingAddress = addressParts.join(', ');

    // Build cart items from localStorage cart (bypasses Redis cart — works for guest & logged-in)
    const cartItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,  // Send price from localStorage cart as fallback for product-service
    }));

    setSubmitting(true);
    try {
      const result = await checkout(
        {
          shippingAddress,
          paymentMethod: UI_TO_PAYMENT_METHOD[paymentMethod],
          note: note.trim() || undefined,
          couponCode: couponCode.trim() || undefined,
          guestName: buyerName.trim(),
          guestEmail: buyerEmail.trim() || undefined,
          guestPhone: buyerPhone.trim(),
          items: cartItems,
        },
        idempotencyKey.current,
      );

      await clearCart();
      toast.success('Đặt hàng thành công!');

      // Redirect to success page, carry orderId + orderNumber (+ paymentUrl for online payment)
      const params = new URLSearchParams({
        orderId:     result.orderId,
        orderNumber: result.orderNumber,
      });
      if (result.paymentUrl) {
        // For online payment, redirect to payment gateway
        window.location.href = result.paymentUrl;
      } else {
        router.push(`/cart/checkout/success?${params.toString()}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-24 text-on-surface-variant">
        Đang tải thông tin giỏ hàng...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 py-24 text-on-surface-variant">
        <span className="material-symbols-outlined text-[64px]">shopping_cart</span>
        <p className="text-body-lg">Giỏ hàng của bạn đang trống.</p>
        <Link href="/product" className="mt-2 h-11 px-6 bg-primary text-on-primary rounded-xl font-bold inline-flex items-center gap-2 hover:bg-primary/90 transition-colors">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-surface-container-low py-8">
      <div className="max-w-container-max mx-auto px-gutter">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/cart" className="hover:text-primary">Giỏ hàng</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">Thanh toán</span>
        </nav>

        <h1 className="text-headline-md font-headline-md text-on-surface mb-8">Tiến hành thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left: Forms ─────────────────────────────── */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">

            {/* 1. Buyer Info */}
            <section className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                <h2 className="text-title-lg font-title-lg text-on-surface">1. Thông tin người đặt hàng</h2>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={(e) => e.preventDefault()}>
                <div className="md:col-span-2">
                  <label className="block text-label-sm text-on-surface-variant mb-1">Họ và tên <span className="text-error">*</span></label>
                  <input
                    className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md bg-surface-container-lowest"
                    placeholder="VD: Nguyễn Văn A"
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Số điện thoại <span className="text-error">*</span></label>
                  <input
                    className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md bg-surface-container-lowest"
                    placeholder="VD: 0912345678"
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Email (tùy chọn)</label>
                  <input
                    className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md bg-surface-container-lowest"
                    placeholder="VD: example@email.com"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                  />
                </div>
              </form>
            </section>

            {/* 2. Shipping Info */}
            <section className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                <h2 className="text-title-lg font-title-lg text-on-surface">2. Thông tin nhận hàng</h2>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={(e) => e.preventDefault()}>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Tỉnh / Thành phố *</label>
                    <input
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md bg-surface-container-lowest"
                      placeholder="VD: TP. Hồ Chí Minh"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Quận / Huyện</label>
                    <input
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md bg-surface-container-lowest"
                      placeholder="VD: Quận 1"
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Phường / Xã</label>
                    <input
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md bg-surface-container-lowest"
                      placeholder="VD: Phường Bến Nghé"
                      type="text"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-label-sm text-on-surface-variant mb-1">Số nhà, Tên đường *</label>
                  <input
                    className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md bg-surface-container-lowest"
                    placeholder="Số nhà, Tên đường, Tòa nhà..."
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-label-sm text-on-surface-variant mb-1">Ghi chú (tùy chọn)</label>
                  <textarea
                    className="w-full p-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md bg-surface-container-lowest resize-none"
                    placeholder="Ghi chú về thời gian, hướng dẫn giao hàng..."
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </form>
            </section>

            {/* 3. Payment method */}
            <section className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                <h2 className="text-title-lg font-title-lg text-on-surface">3. Phương thức thanh toán</h2>
              </div>
              <div className="flex flex-col gap-4">
                {([
                  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', sub: 'Kiểm tra hàng trước khi thanh toán', icon: 'payments' },
                  { id: 'bank', label: 'VietQR / Chuyển khoản ngân hàng', sub: 'Thanh toán qua cổng VNPAY — quét QR hoặc chuyển khoản', icon: 'qr_code_scanner' },
                  { id: 'card', label: 'Thẻ ATM / Thẻ tín dụng', sub: 'Visa, MasterCard, JCB, VNPAY', icon: 'credit_card' },
                  { id: 'installment', label: 'Trả góp 0% qua thẻ tín dụng', sub: 'Kỳ hạn 3, 6, 9, 12 tháng', icon: 'percent' },
                ] as const).map((opt) => {
                  const selected = paymentMethod === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'}`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={selected}
                          onChange={() => setPaymentMethod(opt.id)}
                          className="w-5 h-5 text-primary focus:ring-primary border-outline-variant"
                        />
                        <div className="flex flex-col">
                          <span className="text-body-md font-medium text-on-surface">{opt.label}</span>
                          <span className={`text-label-sm ${selected ? 'text-primary' : 'text-on-surface-variant'}`}>{opt.sub}</span>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined ${selected ? 'text-primary' : 'text-outline'}`}>{opt.icon}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex items-start gap-2 text-label-sm text-on-surface-variant bg-surface-container p-3 rounded-lg">
                <span className="material-symbols-outlined text-[18px] text-primary">security</span>
                <p>Thông tin thanh toán của bạn được mã hóa an toàn theo chuẩn SSL.</p>
              </div>
            </section>
          </div>

          {/* ── Right: Order Summary ─────────────────────── */}
          <div className="w-full lg:w-1/3">
            <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-4">
                <h2 className="text-title-lg font-title-lg text-on-surface">Tóm tắt đơn hàng</h2>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-label-sm font-bold">
                  {cart.totalItems} SP
                </span>
              </div>

              {/* Cart items */}
              <div className="flex flex-col gap-4 mb-6 max-h-64 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-14 h-14 rounded-lg object-cover border border-outline-variant shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-surface-container border border-outline-variant shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px] text-outline">inventory_2</span>
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <p className="text-label-sm font-medium text-on-surface line-clamp-2">{item.productName}</p>
                      <p className="text-label-sm text-on-surface-variant mt-0.5">SL: {item.quantity}</p>
                    </div>
                    <span className="text-body-sm font-bold text-on-surface shrink-0">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="mb-6 border-t border-outline-variant pt-4">
                <label className="block text-label-sm text-on-surface-variant mb-2">Mã giảm giá / Voucher</label>
                <div className="flex gap-2">
                  <input
                    className="flex-grow h-10 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-body-md bg-surface-container-lowest uppercase"
                    placeholder="Nhập mã khuyến mãi"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button className="h-10 px-4 bg-surface-container-high hover:bg-surface-variant text-on-surface font-medium rounded-lg transition-colors border border-outline-variant">Áp dụng</button>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-3 mb-6 border-t border-outline-variant pt-4">
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Tạm tính</span>
                  <span className="font-medium text-on-surface">{formatCurrency(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-primary">Miễn phí</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-end mb-8 border-t border-outline-variant pt-4">
                <span className="text-title-lg font-title-lg text-on-surface">Tổng cộng</span>
                <div className="text-right">
                  <span className="block text-headline-sm font-headline-sm text-primary">{formatCurrency(cart.totalAmount)}</span>
                  <span className="text-[11px] text-on-surface-variant">(Đã bao gồm VAT)</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleOrder}
                disabled={submitting}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-on-primary text-title-md font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Xác nhận đặt hàng
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-on-surface-variant mt-4">
                Bằng việc đặt hàng, bạn đồng ý với{' '}
                <Link href="/terms" className="text-primary hover:underline">Điều khoản & Dịch vụ</Link> của NexaTech.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
