'use client';

import { useEffect, useRef, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Clock } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductCard } from '@/features/products/components/product-card';
import type { ProductSummary } from '@/features/products/types';

interface FlashSaleProps {
  products: ProductSummary[];
}

export function FlashSale({ products }: FlashSaleProps) {
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [timeLeft, setTimeLeft] = useState('02:45:30');
  const featured = products.slice(0, 6);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        const [hours, minutes, seconds] = previous.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds - 1;
        const nextHours = Math.floor(totalSeconds / 3600) % 24;
        const nextMinutes = Math.floor((totalSeconds % 3600) / 60);
        const nextSeconds = totalSeconds % 60;

        return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}:${String(nextSeconds).padStart(2, '0')}`;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="overflow-hidden rounded-4xl border border-danger/20 bg-linear-to-r from-danger via-danger/90 to-warning/80 shadow-lg">
        <div className="rounded-4xl bg-bg-elevated">
          <div className="flex flex-col gap-4 border-b border-border px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-danger">Hot now</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-text-primary">Ưu đãi đang nổi bật</h3>
              <p className="mt-1 text-sm text-text-secondary">Dữ liệu được lấy từ `GET /api/v1/products/featured`.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-4 py-2 text-sm font-semibold text-danger">
              <Clock className="h-4 w-4" />
              {timeLeft}
            </div>
          </div>

          <div className="px-6 py-6">
            {featured.length > 0 ? (
              <Carousel
                opts={{ align: 'start', loop: true }}
                plugins={[autoplay.current as never]}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {featured.map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/5">
                      <ProductCard product={product} variant="compact" className="h-full" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 border-border/60 bg-bg-elevated/90 dark:bg-gray-800/90 dark:border-border/50" />
                <CarouselNext className="right-2 border-border/60 bg-bg-elevated/90 dark:bg-gray-800/90 dark:border-border/50" />
              </Carousel>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-bg-base px-6 py-10 text-center text-sm text-text-secondary">
                Chưa có dữ liệu để hiển thị cho khối nổi bật.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
