'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader2, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getCart, checkout, getApiErrorMessage } from '@/lib/cartApi';
import { formatCurrency } from '@/lib/format';
import type { Cart, CheckoutRequest } from '@/types/cart';
import { PaymentMethod } from '@/types/cart';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: PaymentMethod.COD, label: 'Thanh toán khi nhận hàng', description: 'Trả tiền mặt khi nhận hàng' },
  { value: PaymentMethod.VNPAY, label: 'VNPay', description: 'Thanh toán qua cổng VNPay' },
  { value: PaymentMethod.BANK_TRANSFER, label: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản trực tiếp' },
  { value: PaymentMethod.MOMO, label: 'MoMo', description: 'Ví điện tử MoMo' },
];

const SHIPPING_OPTIONS = [
  { value: 'STANDARD', label: 'Tiêu chuẩn', description: '3-5 ngày', fee: 30000 },
  { value: 'EXPRESS', label: 'Nhanh', description: '1-2 ngày', fee: 50000 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const shippingFee = cart && cart.totalPrice >= 500000 ? 0 : SHIPPING_OPTIONS.find((s) => s.value === shippingMethod)?.fee ?? 30000;
  const total = (cart?.totalPrice ?? 0) + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
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

      router.push(`/cart/checkout/success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đặt hàng thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cart) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="size-4" />
        Quay lại giỏ hàng
      </Link>

      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Địa chỉ giao hàng */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Nhập địa chỉ giao hàng đầy đủ"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="h-11"
                  required
                  disabled={submitting}
                />
              </CardContent>
            </Card>

            {/* Phương thức vận chuyển */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="size-5" />
                  Phương thức vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SHIPPING_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      shippingMethod === option.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.value}
                        checked={shippingMethod === option.value}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="accent-primary"
                        disabled={submitting}
                      />
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {cart.totalPrice >= 500000 ? 'Miễn phí' : formatCurrency(option.fee)}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Phương thức thanh toán */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === option.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={() => setPaymentMethod(option.value)}
                      className="accent-primary"
                      disabled={submitting}
                    />
                    <div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Ghi chú */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={submitting}
                />
              </CardContent>
            </Card>
          </div>

          {/* Tổng đơn hàng */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Đơn hàng của bạn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.productName}</p>
                        <p className="text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="ml-3 shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatCurrency(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt hàng'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
