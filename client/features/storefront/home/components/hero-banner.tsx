'use client';

import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

/** Kích thước gốc artwork carousel (1672×941, ~16:9) */
const CAROUSEL_ASPECT = 1672 / 941;

const bannerSlides = [
  { image: '/carousel/1.jpg' },
  { image: '/carousel/2.jpg' },
  { image: '/carousel/3.jpg' },
  { image: '/carousel/4.jpg' },
];

export function HeroBanner() {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pt-5">
      <Carousel
        plugins={[plugin.current as never]}
        className="group relative w-full overflow-hidden rounded-md [&_[data-slot=carousel-content]]:h-full"
        style={{ aspectRatio: CAROUSEL_ASPECT }}
        opts={{ loop: true }}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="-ml-0 h-full">
          {bannerSlides.map((slide, index) => (
            <CarouselItem key={index} className="h-full pl-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={`Banner ${index + 1}`}
                width={1672}
                height={941}
                className="block h-full w-full object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-2.5 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full border-0 bg-black/25 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100">
          <ChevronLeft className="h-4 w-4" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-2.5 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full border-0 bg-black/25 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100">
          <ChevronRight className="h-4 w-4" />
        </CarouselNext>

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
