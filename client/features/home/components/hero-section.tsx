'use client';

import { ChevronRight, Phone, Tablet, Laptop, Headphones, Watch, Tv, RefreshCcw, Tag } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const categoryIcons = [
    { name: 'Điện thoại', icon: <Phone className="w-5 h-5" /> },
    { name: 'Tablet', icon: <Tablet className="w-5 h-5" /> },
    { name: 'Mac', icon: <Laptop className="w-5 h-5" /> },
    { name: 'Máy cũ', icon: <RefreshCcw className="w-5 h-5" /> },
    { name: 'Phụ kiện', icon: <Headphones className="w-5 h-5" /> },
    { name: 'Đồng hồ', icon: <Watch className="w-5 h-5" /> },
    { name: 'Âm thanh', icon: <Headphones className="w-5 h-5" /> },
    { name: 'Gia dụng', icon: <Tv className="w-5 h-5" /> },
    { name: 'Khuyến mãi', icon: <Tag className="w-5 h-5" /> },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-6 space-y-4">
      <div className="flex gap-4">
        {/* Left Category Sidebar */}
        <div className="hidden lg:flex flex-col w-[200px] xl:w-[220px] bg-bg-elevated dark:bg-bg-elevated rounded-xl shadow-sm border border-border dark:border-border/50 py-3 h-[400px] overflow-y-auto transition-smooth">
          {categoryIcons.map((item, i) => (
            <a
              key={i}
              href="#"
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth text-sm font-medium group"
            >
              <span className="flex items-center gap-3 text-text-primary dark:text-text-inverse">
                <span className="text-primary group-hover:text-primary-light transition-smooth">{item.icon}</span>
                {item.name}
              </span>
              <ChevronRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-smooth" />
            </a>
          ))}
        </div>

        {/* Hero Carousel */}
        <div className="flex-1 relative group">
          <Carousel
            plugins={[plugin.current as never]}
            className="w-full h-[250px] md:h-[300px] lg:h-[400px] rounded-xl overflow-hidden"
            opts={{ loop: true }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="h-full">
              {[1, 2, 3].map((_, index) => (
                <CarouselItem key={index} className="h-full relative">
                  <img
                    src={`https://picsum.photos/seed/didonghero${index}/1200/400`}
                    alt={`Banner ${index}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex flex-col items-start justify-center px-6 md:px-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white mb-3 max-w-2xl leading-tight">
                      Công Nghệ<br />
                      <span className="bg-gradient-to-r from-secondary to-primary-light bg-clip-text text-transparent">
                        Tương Lai
                      </span>
                    </h2>
                    <p className="text-white/90 text-sm md:text-base mb-6 max-w-xl">
                      Khám phá những sản phẩm công nghệ mới nhất với giá tốt nhất
                    </p>
                    <Button
                      variant="default"
                      size="lg"
                      className="rounded-full font-bold"
                    >
                      Mua ngay →
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Carousel Controls */}
            <div className="absolute left-0 right-0 bottom-4 flex justify-center gap-2 z-20">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-smooth"
                />
              ))}
            </div>

            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 border-none text-white opacity-0 group-hover:opacity-100 transition-smooth" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 border-none text-white opacity-0 group-hover:opacity-100 transition-smooth" />
          </Carousel>
        </div>
      </div>

      {/* Category Pills for Mobile */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
        {categoryIcons.slice(0, 5).map((item, i) => (
          <button
            key={i}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/5 text-primary rounded-full text-sm font-medium flex-shrink-0 hover:bg-primary/20 dark:hover:bg-primary/10 transition-smooth"
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}
