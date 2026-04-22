'use client';

import { Search, MapPin, Phone, Truck, Gift, ShoppingCart, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Header() {
    return (
        <header className="w-full bg-primary text-white sticky top-0 z-50">
            <div className="max-w-[1200px] mx-auto px-4 h-[60px] flex items-center justify-between gap-3 text-xs xl:text-sm">
                {/* Logo & Category Button */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 cursor-pointer">
                        <div className="font-extrabold text-xl tracking-tight hidden sm:block">Nexatech</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl relative">
                    <Input
                        type="search"
                        placeholder="Bạn cần tìm gì?"
                        className="w-full pl-4 pr-12 h-9 rounded-full bg-white text-black border-none focus-visible:ring-0 shadow-inner"
                    />
                    <button className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:text-primary transition-colors">
                        <Search className="h-4 w-4" />
                    </button>
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center justify-end gap-3 lg:gap-5 whitespace-nowrap">
                    <a href="#" className="flex items-center gap-1.5 hover:text-white/80 transition-colors group">
                        <div className="p-1.5 bg-white/10 rounded-full group-hover:bg-white/20">
                            <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-[10px] lg:text-xs leading-[1.2]">
                            <span className="text-white/90">Gọi mua hàng</span>
                            <span className="font-bold">1800.6018</span>
                        </div>
                    </a>
                    <a href="#" className="flex items-center gap-1.5 hover:text-white/80 transition-colors group">
                        <div className="p-1.5 bg-white/10 rounded-full group-hover:bg-white/20">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-[10px] lg:text-xs leading-[1.2]">
                            <span className="text-white/90">Cửa hàng</span>
                            <span className="font-bold">gần bạn</span>
                        </div>
                    </a>
                    <a href="#" className="flex items-center gap-1.5 hover:text-white/80 transition-colors group">
                        <div className="p-1.5 bg-white/10 rounded-full group-hover:bg-white/20">
                            <Truck className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-[10px] lg:text-xs leading-[1.2]">
                            <span className="text-white/90">Tra cứu</span>
                            <span className="font-bold">đơn hàng</span>
                        </div>
                    </a>
                    <a href="#" className="flex items-center gap-1.5 hover:text-white/80 transition-colors group">
                        <div className="p-1.5 bg-white/10 rounded-full group-hover:bg-white/20">
                            <Gift className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-[10px] lg:text-xs leading-[1.2]">
                            <span className="text-white/90">Khuyến</span>
                            <span className="font-bold">mãi</span>
                        </div>
                    </a>
                    <a href="#" className="flex items-center gap-1.5 hover:text-white/80 transition-colors group">
                        <div className="p-1.5 bg-white/10 rounded-full group-hover:bg-white/20">
                            <ShoppingCart className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-[10px] lg:text-xs leading-[1.2]">
                            <span className="text-white/90">Giỏ</span>
                            <span className="font-bold">hàng</span>
                        </div>
                    </a>
                </div>
            </div>
        </header>
    );
}
