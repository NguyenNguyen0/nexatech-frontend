'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ProductCard } from '@/features/products/components/product-card';
import type { ProductMinimal } from '@/features/products/types';
import { cn } from '@/lib/utils';

interface CollectionProductCarouselProps {
  title: string;
  href: string;
  products: ProductMinimal[];
}

const PRODUCTS_PER_SLIDE = 4;

export function CollectionProductCarousel({ title, href, products }: CollectionProductCarouselProps) {
  const slides = useMemo(() => {
    const chunks: ProductMinimal[][] = [];
    for (let index = 0; index < products.length; index += PRODUCTS_PER_SLIDE) {
      chunks.push(products.slice(index, index + PRODUCTS_PER_SLIDE));
    }
    return chunks;
  }, [products]);
  const [api, setApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const canSlide = slides.length > 1;

  useEffect(() => {
    if (!api) return;

    const syncActiveSlide = () => {
      setActiveSlide(api.selectedScrollSnap());
    };

    syncActiveSlide();
    api.on('select', syncActiveSlide);
    api.on('reInit', syncActiveSlide);

    return () => {
      api.off('select', syncActiveSlide);
      api.off('reInit', syncActiveSlide);
    };
  }, [api]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-container-max px-4 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href={href} className="min-w-0 text-lg font-bold text-on-surface transition hover:text-primary">
          {title}
        </Link>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-storefront-primary transition hover:underline"
        >
          Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <Carousel
        setApi={setApi}
        opts={{ loop: canSlide, align: 'start' }}
        className="group relative w-full"
      >
        <CarouselContent className="-ml-2.5">
          {slides.map((slide, slideIndex) => (
            <CarouselItem key={slideIndex} className="pl-2.5">
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {slide.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className={cn('min-h-[24rem] md:min-h-[26rem]')}
                  />
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {canSlide ? (
          <>
            <CarouselPrevious
              title="Trước"
              aria-label="Trước"
              className="absolute left-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full border-0 bg-black/25 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100 disabled:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </CarouselPrevious>
            <CarouselNext
              title="Tiếp"
              aria-label="Tiếp"
              className="absolute right-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full border-0 bg-black/25 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100 disabled:hidden"
            >
              <ChevronRight className="h-5 w-5" />
            </CarouselNext>

            <div className="mt-3 flex justify-center gap-1.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  title={`Trang ${index + 1}`}
                  aria-label={`Trang ${index + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    index === activeSlide ? 'w-5 bg-primary' : 'w-1.5 bg-outline-variant hover:bg-primary/60',
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </Carousel>
    </section>
  );
}
