'use client';

import { useEffect, useRef, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

/** Kích thước gốc artwork carousel (1672×941, ~16:9) */
const CAROUSEL_ASPECT = 1672 / 941;

const bannerSlides = [
  { image: '/carousel/1.png' },
  { image: '/carousel/2.png' },
];

const subBannerSlides = [
  { image: '/carousel/sub-carousel/1.png' },
  { image: '/carousel/sub-carousel/2.png' },
  { image: '/carousel/sub-carousel/3.png' },
  { image: '/carousel/sub-carousel/4.jpg' },
];

export function HeroBanner() {
  const mainAutoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const subAutoplay = useRef(Autoplay({ delay: 6000, stopOnInteraction: true }));

  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [currentMain, setCurrentMain] = useState(0);

  useEffect(() => {
    if (!mainApi) return;
    setCurrentMain(mainApi.selectedScrollSnap());
    mainApi.on('select', () => {
      setCurrentMain(mainApi.selectedScrollSnap());
    });
  }, [mainApi]);

  return (
    <section className="w-full bg-surface-container-lowest pb-6">
      {/* Main Hero Carousel */}
      <Carousel
        setApi={setMainApi}
        plugins={[mainAutoplay.current as never]}
        className="group relative w-full overflow-hidden"
        opts={{ loop: true }}
        onMouseEnter={mainAutoplay.current.stop}
        onMouseLeave={mainAutoplay.current.reset}
      >
        <CarouselContent className="-ml-0">
          {bannerSlides.map((slide, index) => (
            <CarouselItem key={index} className="pl-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={`Banner ${index + 1}`}
                className="w-full h-auto block"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full border-0 bg-black/25 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100">
          <ChevronLeft className="h-5 w-5" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-4 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full border-0 bg-black/25 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100">
          <ChevronRight className="h-5 w-5" />
        </CarouselNext>

        <div className="absolute bottom-24 md:bottom-36 lg:bottom-44 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {bannerSlides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentMain ? 'w-5 bg-white' : 'w-1.5 bg-white/45'
                }`}
            />
          ))}
        </div>
      </Carousel>

      {/* Sub-Carousel (2 images side-by-side on desktop) */}
      <div className="mx-auto w-full max-w-[1200px] px-4 -mt-20 md:-mt-32 lg:-mt-40 relative z-30">
        <Carousel
          plugins={[subAutoplay.current as never]}
          opts={{ loop: true, align: 'start' }}
          className="group relative w-full"
          onMouseEnter={subAutoplay.current.stop}
          onMouseLeave={subAutoplay.current.reset}
        >
          <CarouselContent className="-ml-3.5">
            {subBannerSlides.map((slide, index) => (
              <CarouselItem key={index} className="pl-3.5 basis-full md:basis-1/2">
                <div className="overflow-hidden rounded-xl border border-[#e8e8e8] shadow-sm bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={`Sub Banner ${index + 1}`}
                    className="w-full h-auto object-cover hover:scale-[1.015] transition-transform duration-300 cursor-pointer"
                  />
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
        </Carousel>
      </div>
    </section>
  );
}
