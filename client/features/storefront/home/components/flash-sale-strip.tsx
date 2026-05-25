'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Zap } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from '@/components/ui/carousel';
import type { FlashSaleStripItem } from '@/features/flash-sale/services/flash-sale-strip-loader';

type Countdown = { hours: string; minutes: string; seconds: string };

function getCountdown(target: number): Countdown {
  const distance = Math.max(0, target - Date.now());
  return {
    hours: String(Math.floor(distance / 3_600_000)).padStart(2, '0'),
    minutes: String(Math.floor((distance % 3_600_000) / 60_000)).padStart(2, '0'),
    seconds: String(Math.floor((distance % 60_000) / 1_000)).padStart(2, '0'),
  };
}

interface FlashSaleStripProps {
  items: FlashSaleStripItem[];
  endsAt: number;
}

function formatVND(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${star <= Math.floor(rating) ? 'fill-[#f5a623] text-[#f5a623]' : star <= rating ? 'fill-[#f5a623]/50 text-[#f5a623]' : 'fill-[#ddd] text-[#ddd]'}`}
        />
      ))}
    </div>
  );
}

export function FlashSaleStrip({ items, endsAt }: FlashSaleStripProps) {
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(endsAt));
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  useEffect(() => {
    if (endsAt === 0) return;
    const timer = window.setInterval(() => setCountdown(getCountdown(endsAt)), 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pt-7 pb-2">
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Zap className="h-5 w-5 text-[#e30019]" />
            <h2 className="text-lg font-bold text-[#1b1c1c]">Flash Sale</h2>
          </div>
          <div className="flex items-center gap-1">
            {[countdown.hours, countdown.minutes, countdown.seconds].map((unit, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-xs font-bold text-[#333]">:</span>}
                <span className="rounded bg-[#1b1c1c] px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                  {unit}
                </span>
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/flash-sale"
          className="flex items-center gap-1 text-[12px] font-semibold text-[#004d75] hover:text-[#e30019] transition-colors"
        >
          Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Products Carousel */}
      <div className="relative rounded-md border border-[#e0e0e0] bg-white p-3 shadow-sm">
        <Carousel
          opts={{ align: 'start', loop: true }}
          plugins={[autoplay.current as never]}
          className="w-full"
        >
          <CarouselContent className="-ml-2.5">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-[48%] pl-2.5 sm:basis-[36%] md:basis-[28%] lg:basis-1/5"
              >
                <Link
                  href={item.productSlug ? `/product/${item.productSlug}` : `/product/${item.productId}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded bg-[#f7f7f7] p-2.5">
                    {/* Discount Badge */}
                    <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-[#e30019] px-1.5 py-[1px] text-[10px] font-bold text-white">
                      -{item.discountPercent}%
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.productImage ?? `https://placehold.co/300x300/f7f7f7/999?text=NexaTech`}
                      alt={item.productName}
                      className="mx-auto aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-[12px] font-medium text-[#333] line-clamp-2 leading-[1.4]">
                      {item.productName}
                    </p>
                    <RatingStars rating={item.productRating ?? 4.5} />
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-[13px] font-bold text-[#e30019]">
                        {formatVND(item.salePrice)}
                      </p>
                      <p className="text-[10px] text-[#999] line-through">
                        {formatVND(item.originalPrice)}
                      </p>
                    </div>
                    {/* Stock progress bar */}
                    <div className="h-1 w-full rounded-full bg-[#eee] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#e30019]"
                        style={{ width: `${Math.min(item.soldPercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#999]">
                      Còn {item.remainingStock}/{item.totalStock}
                    </p>
                    <button
                      type="button"
                      className="mt-0.5 w-full rounded-sm border border-[#004d75] py-1 text-[11px] font-semibold text-[#004d75] transition hover:bg-[#004d75] hover:text-white"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext className="absolute -right-1.5 top-[30%] h-7 w-7 rounded-full border border-[#ddd] bg-white shadow-sm hover:border-[#004d75]">
            <ChevronRight className="h-3.5 w-3.5" />
          </CarouselNext>
        </Carousel>
      </div>

      {/* CTA button */}
      <div className="mt-3 flex justify-center">
        <Link
          href="/flash-sale"
          className="inline-flex items-center gap-1.5 rounded border border-[#e30019] px-5 py-1.5 text-[13px] font-semibold text-[#e30019] transition hover:bg-[#e30019] hover:text-white"
        >
          <Zap className="h-3.5 w-3.5" />
          Xem chi tiết Flash Sale
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
