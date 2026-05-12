'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Zap } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from '@/components/ui/carousel';

type Countdown = { hours: string; minutes: string; seconds: string };

function getCountdown(target: number): Countdown {
  const distance = Math.max(0, target - Date.now());
  return {
    hours: String(Math.floor(distance / 3_600_000)).padStart(2, '0'),
    minutes: String(Math.floor((distance % 3_600_000) / 60_000)).padStart(2, '0'),
    seconds: String(Math.floor((distance % 60_000) / 1_000)).padStart(2, '0'),
  };
}

const flashSaleProducts = [
  {
    id: '1',
    name: 'Laptop Gaming Acer Nitro 5',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&h=300&fit=crop',
    price: 19_380_000,
    originalPrice: 24_800_000,
    discount: 22,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'PC Gaming Intel i7 RTX 4060',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&h=300&fit=crop',
    price: 19_390_000,
    originalPrice: 24_200_000,
    discount: 20,
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Màn hình LG 27" 4K IPS',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop',
    price: 12_990_000,
    originalPrice: 19_990_000,
    discount: 35,
    rating: 4.5,
  },
  {
    id: '4',
    name: 'Chuột Logitech G502 Hero',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop',
    price: 1_190_000,
    originalPrice: 1_590_000,
    discount: 25,
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Bàn phím cơ Corsair K70',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&h=300&fit=crop',
    price: 2_690_000,
    originalPrice: 3_190_000,
    discount: 15,
    rating: 4.0,
  },
];

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

export function FlashSaleStrip() {
  const saleEndsAt = useMemo(() => Date.now() + 8 * 3_600_000 + 45 * 60_000 + 30_000, []);
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(saleEndsAt));
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown(saleEndsAt)), 1000);
    return () => window.clearInterval(timer);
  }, [saleEndsAt]);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pt-7 pb-2">
      {/* Section Header */}
      <div className="mb-3 flex items-center gap-3">
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

      {/* Products Carousel */}
      <div className="relative rounded-md border border-[#e0e0e0] bg-white p-3 shadow-sm">
        <Carousel
          opts={{ align: 'start', loop: true }}
          plugins={[autoplay.current as never]}
          className="w-full"
        >
          <CarouselContent className="-ml-2.5">
            {flashSaleProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-[48%] pl-2.5 sm:basis-[36%] md:basis-[28%] lg:basis-1/5"
              >
                <Link href={`/product/${product.id}`} className="group block">
                  <div className="relative overflow-hidden rounded bg-[#f7f7f7] p-2.5">
                    {/* Discount Badge */}
                    <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-[#e30019] px-1.5 py-[1px] text-[10px] font-bold text-white">
                      -{product.discount}%
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="mx-auto aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-[12px] font-medium text-[#333] line-clamp-2 leading-[1.4]">
                      {product.name}
                    </p>
                    <RatingStars rating={product.rating} />
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-[13px] font-bold text-[#e30019]">
                        {formatVND(product.price)}
                      </p>
                      <p className="text-[10px] text-[#999] line-through">
                        {formatVND(product.originalPrice)}
                      </p>
                    </div>
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
    </section>
  );
}
