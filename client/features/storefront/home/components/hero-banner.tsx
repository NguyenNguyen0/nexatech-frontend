'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const bannerSlides = [
  {
    title: 'NEXT GENERATION\nTECHNOLOGY',
    subtitle: 'Giới thiệu dòng gaming hiệu năng vượt trội nhất dành cho bạn',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&h=500&fit=crop',
    cta1: 'Mua ngay',
    cta2: 'Xem ưu đãi',
  },
  {
    title: 'GAMING LAPTOP\nSIÊU MẠNH',
    subtitle: 'Hiệu năng vượt trội với RTX 4060, màn hình 165Hz QHD',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&h=500&fit=crop',
    cta1: 'Mua ngay',
    cta2: 'Chi tiết',
  },
  {
    title: 'SETUP GAMING\nĐỈNH CAO',
    subtitle: 'Trọn bộ gaming gear chính hãng, giá tốt nhất thị trường',
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=1200&h=500&fit=crop',
    cta1: 'Khám phá',
    cta2: 'Ưu đãi Hot',
  },
];

export function HeroBanner() {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pt-5">
      <Carousel
        plugins={[plugin.current as never]}
        className="group relative w-full overflow-hidden rounded-md"
        opts={{ loop: true }}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="h-[260px] sm:h-[320px] md:h-[360px] lg:h-[400px]">
          {bannerSlides.map((slide, index) => (
            <CarouselItem key={index} className="relative h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={`Banner ${index + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#002940]/90 via-[#002940]/55 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-center px-7 sm:px-10 md:px-14">
                <h2 className="whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[42px]">
                  {slide.title}
                </h2>
                <p className="mt-2.5 max-w-[400px] text-[13px] leading-relaxed text-white/75 sm:text-sm">
                  {slide.subtitle}
                </p>
                <div className="mt-5 flex gap-2.5">
                  <Link
                    href="/product"
                    className="rounded-sm bg-[#004d75] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#003d5c]"
                  >
                    {slide.cta1}
                  </Link>
                  <Link
                    href="/product"
                    className="rounded-sm border border-white/50 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/15"
                  >
                    {slide.cta2}
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-2.5 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full border-0 bg-black/25 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100">
          <ChevronLeft className="h-4 w-4" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-2.5 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full border-0 bg-black/25 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100">
          <ChevronRight className="h-4 w-4" />
        </CarouselNext>

        {/* Dot Indicators */}
        <div className="absolute bottom-3.5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {bannerSlides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition ${i === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/45'}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
