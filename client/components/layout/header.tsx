'use client';

import { Search, Phone, ShoppingCart, UserRound, Menu, X, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useState } from 'react';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-elevated/95 backdrop-blur-md dark:border-border/50 dark:bg-bg-elevated/80 transition-smooth">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-primary to-secondary text-text-inverse py-2 px-4">
        <div className="max-w-[1200px] mx-auto text-xs font-medium flex justify-between items-center">
          <span>🎁 Ưu đãi đặc biệt: Giảm giá tới 50% cho thành viên mới</span>
          <div className="hidden md:flex gap-4">
            <a href="#" className="hover:opacity-80 transition-smooth">Trở thành thành viên</a>
            <a href="#" className="hover:opacity-80 transition-smooth">Bán trên NexaTech</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-lg p-1">
            <span className="text-white font-display font-bold text-lg px-2">NT</span>
          </div>
          <span className="hidden sm:inline font-display font-bold text-lg text-text-primary dark:text-text-inverse">NexaTech</span>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Input
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="rounded-full pl-4 pr-10 bg-bg-sunken dark:bg-gray-700 border-border dark:border-border/50"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-smooth">
            <Search className="h-4 w-4 text-text-tertiary" />
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Phone */}
          <a href="tel:1800.6018" className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth">
            <Phone className="h-4 w-4 text-primary" />
            <div className="text-left text-xs">
              <div className="text-text-tertiary">Gọi mua</div>
              <div className="font-bold text-primary">1800.6018</div>
            </div>
          </a>

          {/* Cart */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth">
            <ShoppingCart className="h-5 w-5 text-text-primary dark:text-text-inverse" />
            <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">0</span>
          </button>

          {/* User */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth">
            <UserRound className="h-5 w-5 text-text-primary dark:text-text-inverse" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5 text-text-tertiary" />
            )}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden border-t border-border dark:border-border/50 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="rounded-full pl-4 pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border dark:border-border/50 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-[1200px] mx-auto px-4 py-3 space-y-2">
            <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-smooth">
              Theo dõi đơn hàng
            </a>
            <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-smooth">
              Khuyến mãi
            </a>
            <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-smooth">
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
