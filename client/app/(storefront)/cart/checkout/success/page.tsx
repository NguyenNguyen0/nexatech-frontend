'use client';

import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="flex-grow bg-surface-container-low py-12 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-xl w-full mx-auto px-gutter">
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-success text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          
          <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Đặt hàng thành công!</h1>
          <p className="text-body-md text-on-surface-variant mb-8">
            Cảm ơn bạn đã mua sắm tại NexaTech. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.
          </p>

          <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-5 mb-8 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant">
              <div className="text-label-sm font-label-sm text-on-surface-variant">Mã đơn hàng</div>
              <div className="text-title-lg font-title-lg text-primary font-bold">NXT-8849201</div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-outline mt-0.5">receipt_long</span>
                <div>
                  <div className="text-label-sm font-label-sm text-on-surface-variant">Phương thức thanh toán</div>
                  <div className="text-body-md font-medium text-on-surface">Chuyển khoản VietQR</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-outline mt-0.5">local_shipping</span>
                <div>
                  <div className="text-label-sm font-label-sm text-on-surface-variant">Thời gian giao hàng dự kiến</div>
                  <div className="text-body-md font-medium text-on-surface">15 tháng 5, 2026 - 18 tháng 5, 2026</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/order" className="flex-1 h-12 flex items-center justify-center gap-2 border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-highest transition-colors font-medium">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              Theo dõi đơn hàng
            </Link>
            <Link href="/" className="flex-1 h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container rounded-xl transition-colors font-medium">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
