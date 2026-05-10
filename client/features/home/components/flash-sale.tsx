'use client';

import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function FlashSale() {
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const products = [
    { name: 'Nồi chiên không dầu 5L 1500W', price: '1.090.000', oldPrice: '1.900.000', discount: '54%', stockLeft: 5, stockPercent: 32 },
    { name: 'Máy vắt cam 0.4L 30W', price: '346.000', oldPrice: '500.000', discount: '30%', stockLeft: 2, stockPercent: 58 },
    { name: 'Máy xay kéo tay 200ml', price: '189.000', oldPrice: '190.000', discount: '1%', stockLeft: 4, stockPercent: 41 },
    { name: 'Nồi chiên không dầu 5L', price: '854.000', oldPrice: '2.150.000', discount: '60%', stockLeft: 1, stockPercent: 24 },
    { name: 'Máy xay thực phẩm đa năng', price: '448.000', oldPrice: '700.000', discount: '36%', stockLeft: 1, stockPercent: 49 },
    { name: 'Bếp nướng điện đa năng', price: '550.000', oldPrice: '990.000', discount: '44%', stockLeft: 4, stockPercent: 44 },
  ];

  const [timeLeft, setTimeLeft] = useState('02:45:30');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const [h, m, s] = prev.split(':').map(Number);
        const total = h * 3600 + m * 60 + s - 1;
        const hours = Math.floor(total / 3600) % 24;
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-danger to-warning/80 rounded-xl overflow-hidden shadow-md border border-danger/20 transition-smooth">
        <div className="bg-bg-elevated dark:bg-bg-elevated rounded-t-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border dark:border-border/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary dark:text-text-inverse">
                  Flash Sale - Giá Sốc
                </h3>
                <p className="text-xs text-text-tertiary">Giảm giá tới 60%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-danger/10 dark:bg-danger/5 text-danger px-4 py-2 rounded-lg font-bold">
              <Clock className="w-4 h-4" />
              {timeLeft}
            </div>
          </div>

          {/* Products */}
          <div className="px-6 py-6">
            <Carousel
              opts={{ align: 'start', loop: true }}
              plugins={[autoplay.current as never]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {products.map((item, i) => (
                  <CarouselItem key={i} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/5">
                    <div className="h-full bg-bg-sunken dark:bg-gray-800 rounded-lg p-3 hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-smooth group cursor-pointer border border-border dark:border-border/50">
                      <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        <span className="absolute top-2 right-2 bg-danger text-white text-xs font-bold px-2 py-1 rounded-lg">
                          -{item.discount}
                        </span>
                        <span className="text-4xl">📦</span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-text-primary dark:text-text-inverse line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                        <div className="flex items-baseline gap-2">
                          <div className="text-lg font-bold text-danger">
                            {item.price}₫
                          </div>
                          <div className="text-xs text-text-tertiary line-through">
                            {item.oldPrice}₫
                          </div>
                        </div>

                        <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-warning to-danger transition-all"
                            style={{ width: `${item.stockPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-text-tertiary">
                          Còn {item.stockLeft}/10 suất
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 border-border/60 bg-bg-elevated/90 dark:bg-gray-800/90 dark:border-border/50" />
              <CarouselNext className="right-2 border-border/60 bg-bg-elevated/90 dark:bg-gray-800/90 dark:border-border/50" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
