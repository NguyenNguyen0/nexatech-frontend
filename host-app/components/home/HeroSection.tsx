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
                            <a
                                key={i}
                                href="#"
                                className="flex items-center justify-between px-4 py-1.5 hover:bg-muted/50 transition-colors text-sm font-medium group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-muted-foreground group-hover:text-primary">{item.icon}</span>
                                    {item.name}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))}
                    </div>

                    {/* Mega Menu Dropdown */}
                    <div className="absolute top-0 left-full ml-1 w-[700px] xl:w-[800px] h-[380px] bg-white border border-gray-200 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50 p-6 flex flex-col md:flex-row gap-8 rounded-lg overflow-hidden">
                         <div className="flex-1">
                             <h4 className="font-bold text-gray-800 mb-3 block">Hãng điện thoại</h4>
                             <div className="grid grid-cols-2 gap-2 mb-4">
                                 <div className="border rounded py-1 px-2 flex justify-center items-center font-bold text-sm">iPhone</div>
                                 <div className="border rounded py-1 px-2 flex justify-center items-center font-bold text-sm">SAMSUNG</div>
                                 <div className="border rounded py-1 px-2 flex justify-center items-center font-bold text-sm">xiaomi</div>
                                 <div className="border rounded py-1 px-2 flex justify-center items-center font-bold text-sm">oppo</div>
                                 <div className="border rounded py-1 px-2 flex justify-center items-center text-sm font-bold text-blue-600">TECNO</div>
                                 <div className="border rounded py-1 px-2 flex justify-center items-center font-bold text-sm">HONOR</div>
                             </div>
                             <h4 className="font-bold text-gray-800 mb-3 block">Mức giá điện thoại</h4>
                             <div className="grid grid-cols-2 gap-2">
                                 <div className="border rounded py-1 px-2 text-center text-xs">Dưới 2 triệu</div>
                                 <div className="border rounded py-1 px-2 text-center text-xs">Từ 2 - 4 triệu</div>
                             </div>
                         </div>
                         <div className="flex-1">
                             <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-1">Điện thoại HOT <span className="text-yellow-500">⚡</span></h4>
                             <div className="grid grid-cols-2 gap-2 mb-4">
                                 <div className="border rounded py-1.5 px-2 flex justify-center items-center text-xs relative">iPhone 17<span className="absolute -top-2 right-0 text-[8px] bg-red-500 text-white px-1 rounded">Hot</span></div>
                                 <div className="border rounded py-1.5 px-2 flex justify-center items-center text-xs">iPhone Air</div>
                                 <div className="border rounded py-1.5 px-2 flex justify-center items-center text-xs">iPhone 16</div>
                                 <div className="border rounded py-1.5 px-2 flex text-center justify-center items-center text-xs relative">Galaxy S26 Ultra<span className="absolute -top-2 right-0 text-[8px] bg-red-500 text-white px-1 rounded">Mới</span></div>
                                 <div className="border rounded py-1.5 px-2 flex justify-center items-center text-xs">OPPO Find N6</div>
                                 <div className="border rounded py-1.5 px-2 flex justify-center items-center text-xs">Redmi Note 15</div>
                             </div>
                         </div>
                         <div className="flex-1 border-l pl-8">
                             <h4 className="font-bold text-gray-800 mb-3 block">Hãng máy tính bảng</h4>
                             <div className="grid grid-cols-2 gap-2 mb-6">
                                 <div className="border rounded py-1 px-2 flex justify-center items-center font-bold text-sm">iPad</div>
                                 <div className="border rounded py-1 px-2 flex justify-center items-center font-bold text-sm">SAMSUNG</div>
                                 <div className="border rounded py-1 px-2 flex justify-center items-center font-bold text-sm text-gray-500">xiaomi</div>
                             </div>
                             <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-1">Máy tính bảng HOT <span className="text-yellow-500">⚡</span></h4>
                             <div className="flex flex-col gap-2">
                                <div className="border rounded py-1.5 px-2 flex justify-center items-center text-xs relative">iPad Pro M5<span className="absolute -top-2 right-0 text-[8px] bg-red-500 text-white px-1 rounded">Mới</span></div>
                                <div className="border rounded py-1.5 px-2 flex justify-center items-center text-xs">Galaxy Tab S11 Series</div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Center Carousel Wrapper */}
                <div className="flex-1 min-w-0 w-full relative h-[250px] md:h-[300px] lg:h-[380px] z-10">
                    <Carousel
                        plugins={[plugin.current as any]}
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
                                    {/* Mockup Text to represent MacBook Neo from Image */}
                                    {index === 0 && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px]">
                                            <div className="text-center font-bold">
                                                <div className="flex items-center justify-center gap-2 mb-2 text-sm">
                                                    <span className="bg-white rounded px-2 py-0.5">🍎</span>
                                                    <span className="font-black text-xl">MacBook Neo</span>
                                                </div>
                                                <h2 className="text-3xl md:text-5xl font-black text-black">
                                                    Mac Tuyệt Vời. <br />
                                                    Giá Bất Ngờ.
                                                </h2>
                                                <div className="flex bg-white/90 p-2 rounded-xl mt-6 gap-4 border border-red-500 text-xs">
                                                    <div className="border-r border-gray-300 pr-4 text-center">
                                                        <div className="text-gray-500 font-normal">
                                                            Học sinh - Sinh viên
                                                        </div>
                                                        <div className="text-red-500 font-bold text-lg leading-tight">
                                                            giảm thêm 600K
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-gray-500 font-normal">Thu cũ đổi mới</div>
                                                        <div className="text-red-500 font-bold text-lg leading-tight">
                                                            Trợ giá 3Triệu
                                                        </div>
                                                    </div>
                                                </div>
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
                        {/* Simple dots mockup */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-primary' : 'bg-gray-300'} shadow-sm`}
                                ></div>
                            ))}
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
