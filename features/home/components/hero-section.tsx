'use client';

import { ChevronRight, Phone, Tablet, Laptop, Headphones, Watch, Tv, RefreshCcw, Tag } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

export function HeroSection() {
  const plugin = useRef(Autoplay({ delay: 3500, stopOnInteraction: true }));

  const categoryIcons = [
    { name: 'Điện thoại', icon: <Phone className="w-4 h-4" /> },
    { name: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { name: 'Mac', icon: <Laptop className="w-4 h-4" /> },
    { name: 'Máy cũ giá rẻ', icon: <RefreshCcw className="w-4 h-4" /> },
    { name: 'Phụ kiện', icon: <Headphones className="w-4 h-4" /> },
    { name: 'Đồng hồ', icon: <Watch className="w-4 h-4" /> },
    { name: 'Âm thanh', icon: <Headphones className="w-4 h-4" /> },
    { name: 'Điện máy, Gia dụng', icon: <Tv className="w-4 h-4" /> },
    { name: 'Apple (AAR)', icon: <Phone className="w-4 h-4" /> },
    { name: 'Xe điện', icon: <Tag className="w-4 h-4" /> },
    { name: 'Màn hình, Tivi', icon: <Tv className="w-4 h-4" /> },
    { name: 'Thu cũ đổi mới', icon: <RefreshCcw className="w-4 h-4" /> },
    { name: 'Khuyến mãi', icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="flex gap-4">
        {/* Left Sidebar Menu */}
        <div className="hidden lg:flex flex-col w-[230px] xl:w-[250px] bg-background rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border/50 py-2 h-[380px] shrink-0 relative group/menu z-20">
          <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {categoryIcons.map((item, i) => (
              <a key={i} href="#" className="flex items-center justify-between px-4 py-1.5 hover:bg-muted/50 transition-colors text-sm font-medium group">
                <span className="flex items-center gap-3">
                  <span className="text-muted-foreground group-hover:text-primary">{item.icon}</span>
                  {item.name}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>

        {/* Center Carousel */}
        <div className="flex-1 min-w-0 w-full relative h-[250px] md:h-[300px] lg:h-[380px] z-10">
          <Carousel
            plugins={[plugin.current as never]}
            className="w-full h-full rounded-lg overflow-hidden shadow-sm"
            opts={{ loop: true }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="h-full">
              {[1, 2, 3].map((_, index) => (
                <CarouselItem key={index} className="h-full relative bg-gray-100">
                  <img
                    src={`https://picsum.photos/seed/didonghero${index}/900/450`}
                    alt={`Banner ${index}`}
                    className="object-cover w-full h-full"
                  />
                  {index === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px]">
                      <div className="text-center font-bold">
                        <h2 className="text-3xl md:text-5xl font-black text-black">
                          Mac Tuyệt Vời. <br /> Giá Bất Ngờ.
                        </h2>
                        <button className="mt-4 border-2 border-black rounded-full px-6 py-1.5 font-bold hover:bg-black hover:text-white transition-colors">
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/50 border-none hover:bg-white text-black w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="right-2 bg-white/50 border-none hover:bg-white text-black w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
