'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Loader2,
  MapPin,
  Truck,
  Check,
  Banknote,
  Wallet,
  Smartphone,
  Building2,
  Lock,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getCart, checkout, getApiErrorMessage } from '@/lib/cartApi';
import { formatCurrency } from '@/lib/format';
import type { Cart, CheckoutRequest } from '@/types/cart';
import { PaymentMethod } from '@/types/cart';

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}[] = [
  {
    value: PaymentMethod.COD,
    label: 'Thanh toán khi nhận hàng',
    description: 'Trả tiền mặt khi nhận hàng',
    icon: <Banknote className="size-5" />,
    available: true,
  },
  {
    value: PaymentMethod.VNPAY,
    label: 'VNPay',
    description: 'Thanh toán qua cổng VNPay',
    icon: <Wallet className="size-5" />,
    available: true,
  },
  {
    value: PaymentMethod.BANK_TRANSFER,
    label: 'Chuyển khoản ngân hàng',
    description: 'Sắp ra mắt',
    icon: <Building2 className="size-5" />,
    available: false,
  },
  {
    value: PaymentMethod.MOMO,
    label: 'MoMo',
    description: 'Sắp ra mắt',
    icon: <Smartphone className="size-5" />,
    available: false,
  },
  {
    value: PaymentMethod.CREDIT_CARD,
    label: 'Thẻ tín dụng / ghi nợ',
    description: 'Sắp ra mắt',
    icon: <CreditCard className="size-5" />,
    available: false,
  },
];

const SHIPPING_OPTIONS = [
  { value: 'STANDARD', label: 'Tiêu chuẩn', description: '3-5 ngày làm việc', fee: 30000 },
  { value: 'EXPRESS', label: 'Nhanh', description: '1-2 ngày làm việc', fee: 50000 },
];

const STEPS = [
  { id: 1, label: 'Giao hàng' },
  { id: 2, label: 'Thanh toán' },
  { id: 3, label: 'Xác nhận' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [note, setNote] = useState('');

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      if (!data || data.items.length === 0) {
        router.replace('/cart');
        return;
      }
      setCart(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể tải giỏ hàng'));
      router.replace('/cart');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const shippingFee =
    cart && cart.totalAmount >= 500000
      ? 0
      : SHIPPING_OPTIONS.find((s) => s.value === shippingMethod)?.fee ?? 30000;
  const total = (cart?.totalAmount ?? 0) + shippingFee;

  const canProceedStep1 = shippingAddress.trim().length > 0;
  const canProceedStep2 = true;

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const body: CheckoutRequest = {
        shippingAddress: shippingAddress.trim(),
        shippingMethod,
        paymentMethod,
        note: note.trim() || undefined,
      };
      const result = await checkout(body);

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      router.push(
        `/cart/checkout/success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đặt hàng thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!cart) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        Quay lại giỏ hàng
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">Thanh toán</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= s.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {step > s.id ? <Check className="size-4" /> : s.id}
              </div>
              <span
                className={`text-xs mt-1.5 transition-colors ${
                  step >= s.id ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-18px] transition-colors duration-300 ${
                  step > s.id ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main form area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="card-nexatech p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <MapPin className="size-5 text-primary" />
                  <h2 className="font-semibold text-lg">Địa chỉ giao hàng</h2>
                </div>
                <input
                  type="text"
                  placeholder="Nhập địa chỉ giao hàng đầy đủ..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  disabled={submitting}
                />
              </div>

              <div className="card-nexatech p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <Truck className="size-5 text-primary" />
                  <h2 className="font-semibold text-lg">Phương thức vận chuyển</h2>
                </div>
                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        shippingMethod === option.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            shippingMethod === option.value
                              ? 'border-primary'
                              : 'border-border'
                          }`}
                        >
                          {shippingMethod === option.value && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        {cart.totalAmount >= 500000 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          formatCurrency(option.fee)
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card-nexatech p-6">
                <h2 className="font-semibold text-lg mb-4">Ghi chú</h2>
                <input
                  type="text"
                  placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  disabled={submitting}
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceedStep1}
                className="btn-pill w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Tiếp tục
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="card-nexatech p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <CreditCard className="size-5 text-primary" />
                  <h2 className="font-semibold text-lg">Phương thức thanh toán</h2>
                </div>
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        !option.available
                          ? 'opacity-50 cursor-not-allowed bg-muted/30'
                          : paymentMethod === option.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-accent/50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          paymentMethod === option.value && option.available
                            ? 'border-primary'
                            : 'border-border'
                        }`}
                      >
                        {paymentMethod === option.value && option.available && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        value={option.value}
                        checked={paymentMethod === option.value}
                        onChange={() => option.available && setPaymentMethod(option.value)}
                        className="hidden"
                        disabled={!option.available || submitting}
                      />
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          paymentMethod === option.value && option.available
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-pill flex-1 bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="size-4" />
                  Quay lại
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className="btn-pill flex-1 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  Xác nhận
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="card-nexatech p-6">
                <h2 className="font-semibold text-lg mb-5">Xác nhận đơn hàng</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                    <MapPin className="size-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Địa chỉ giao hàng</p>
                      <p className="text-sm font-medium mt-0.5">{shippingAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                    <Truck className="size-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vận chuyển</p>
                      <p className="text-sm font-medium mt-0.5">
                        {SHIPPING_OPTIONS.find((s) => s.value === shippingMethod)?.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                    <CreditCard className="size-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Thanh toán</p>
                      <p className="text-sm font-medium mt-0.5">
                        {PAYMENT_OPTIONS.find((p) => p.value === paymentMethod)?.label}
                      </p>
                    </div>
                  </div>

                  {note && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                      <FileText className="size-4 mt-0.5 shrink-0 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ghi chú</p>
                        <p className="text-sm mt-0.5">{note}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Items Preview */}
              <div className="card-nexatech p-6">
                <h3 className="font-semibold text-sm mb-4">Sản phẩm ({cart.totalItems})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <p className="ml-3 shrink-0 font-medium">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-pill flex-1 bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="size-4" />
                  Quay lại
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-pill flex-[2] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      Đặt hàng — {formatCurrency(total)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="card-nexatech p-6 sticky top-6">
            <h2 className="font-semibold text-lg mb-5">Đơn hàng</h2>

            <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                  </div>
                  <p className="ml-3 shrink-0 font-medium">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatCurrency(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span>{shippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : formatCurrency(shippingFee)}</span>
              </div>
            </div>

            <div className="border-t border-border/50 mt-3 pt-3">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
