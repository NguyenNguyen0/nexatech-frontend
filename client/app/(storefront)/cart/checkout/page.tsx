'use client';

import { ShoppingBag, CreditCard, MapPin, Truck } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 page-transition">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <CreditCard className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Thanh toán</h1>
          <p className="text-sm text-muted-foreground">Hoàn tất đơn hàng của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-nexatech p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <MapPin className="size-4 text-primary" />
              Địa chỉ giao hàng
            </h3>
            <div className="space-y-4">
              <input type="text" placeholder="Họ và tên" className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input type="tel" placeholder="Số điện thoại" className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input type="text" placeholder="Địa chỉ" className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <textarea placeholder="Ghi chú (tùy chọn)" rows={3} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>

          <div className="card-nexatech p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Truck className="size-4 text-primary" />
              Phương thức vận chuyển
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="radio" name="shipping" defaultChecked className="accent-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Giao hàng tiêu chuẩn</p>
                  <p className="text-xs text-muted-foreground">3-5 ngày</p>
                </div>
                <span className="text-sm text-green-600 font-medium">Miễn phí</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="radio" name="shipping" className="accent-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Giao hàng nhanh</p>
                  <p className="text-xs text-muted-foreground">1-2 ngày</p>
                </div>
                <span className="text-sm font-medium">30.000 ₫</span>
              </label>
            </div>
          </div>

          <div className="card-nexatech p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="size-4 text-primary" />
              Phương thức thanh toán
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="radio" name="payment" defaultChecked className="accent-primary" />
                <span className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="radio" name="payment" className="accent-primary" />
                <span className="text-sm font-medium">Chuyển khoản ngân hàng</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="radio" name="payment" className="accent-primary" />
                <span className="text-sm font-medium">Ví điện tử (MoMo, ZaloPay)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="card-nexatech p-6 sticky top-20">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <ShoppingBag className="size-4 text-primary" />
              Đơn hàng
            </h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>0 ₫</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phí vận chuyển</span><span className="text-green-600">Miễn phí</span></div>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-primary">0 ₫</span>
            </div>
            <button className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Đặt hàng
            </button>
            <Link href="/cart" className="mt-3 block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
