'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const orderId = searchParams.get('orderId');

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <Card>
        <CardContent className="pt-8 pb-6 space-y-6">
          <div className="flex justify-center">
            <div className="size-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
            <p className="text-muted-foreground">
              Cảm ơn bạn đã mua hàng tại NexaTech
            </p>
          </div>

          {orderNumber && (
            <>
              <Separator />
              <div className="flex items-center justify-center gap-2 text-sm">
                <Package className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-semibold">{orderNumber}</span>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {orderId && (
              <Link href={`/order/${orderId}`}>
                <Button variant="outline" className="w-full">
                  <Package className="size-4 mr-2" />
                  Xem đơn hàng
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button className="w-full">
                Tiếp tục mua sắm
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
