'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const orderNumber = params.get('orderNumber');

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      toast.success('Đã sao chép mã đơn hàng');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
          <CheckCircle className="size-12 text-green-600" />
        </div>
        <div className="absolute -inset-3 rounded-full border-2 border-green-200 animate-ping opacity-20" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-center">
        Đặt hàng thành công!
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-8">
        Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
      </p>

      {/* Order Info Card */}
      {orderNumber && (
        <div className="card-nexatech p-6 w-full max-w-sm mb-8">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Mã đơn hàng
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-primary font-mono">{orderNumber}</span>
              <button
                onClick={copyOrderNumber}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Sao chép mã đơn hàng"
              >
                <Copy className="size-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {orderId && (
          <Link
            href={`http://localhost:3004/orders/${orderId}`}
            className="btn-pill flex-1 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <Package className="size-4" />
            Xem đơn hàng
          </Link>
        )}
        <Link
          href="http://localhost:3001/products"
          className="btn-pill flex-1 bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center gap-2"
        >
          Tiếp tục mua sắm
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
