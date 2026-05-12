'use client';

import { ChevronDown, Heart, Menu, ShoppingCart, Search, UserRound, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const navLinks = [
  { label: 'Laptop', href: '/product/collection/laptop' },
  { label: 'Gaming PC', href: '/product/collection/gaming-pc' },
  { label: 'Monitor', href: '/product/collection/monitor' },
  { label: 'Keyboard', href: '/product/collection/keyboard' },
  { label: 'Mouse', href: '/product/collection/mouse' },
  { label: 'Ghế', href: '/product/collection/chair' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top Bar - Logo, Search, Account */}
      <div className="border-b border-[#e0e0e0] bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-2">
          {/* Logo */}
          <Link href="/" className="flex flex-shrink-0 items-center">
            <Image
              src="/logo/nexatech.png"
              alt="NexaTech"
              width={400}
              height={120}
              className="h-[120px] w-auto object-contain -my-6"
              priority
            />
          </Link>

          {/* Search Bar */}
          <div className="hidden flex-1 max-w-[480px] md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="h-[38px] w-full rounded-sm border border-[#004d75] bg-white px-3 pr-11 text-[13px] text-[#1b1c1c] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-1 focus:ring-[#004d75]"
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex h-[38px] w-10 items-center justify-center bg-[#004d75] text-white transition hover:bg-[#003d5c]"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/user"
              className="hidden items-center gap-1.5 rounded px-2.5 py-1.5 text-[13px] text-[#333] transition hover:bg-[#f0f0f0] sm:flex"
            >
              <UserRound className="h-[18px] w-[18px]" />
              <span className="hidden lg:inline">Tài khoản</span>
            </Link>

            <button
              type="button"
              className="hidden rounded p-2 text-[#333] transition hover:bg-[#f0f0f0] sm:flex"
            >
              <Heart className="h-[18px] w-[18px]" />
            </button>

            <Link
              href="/cart"
              className="relative flex items-center rounded p-2 text-[#333] transition hover:bg-[#f0f0f0]"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e30019] px-0.5 text-[9px] font-bold text-white">
                3
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded p-2 text-[#333] transition hover:bg-[#f0f0f0] lg:hidden"
              type="button"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="border-t border-[#e0e0e0] px-4 py-2 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="h-9 w-full rounded-sm border border-[#004d75] bg-white px-3 pr-10 text-[13px] placeholder:text-[#a0a0a0] focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center bg-[#004d75] text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Second Tier - Category Navigation */}
      <div className="bg-[#004d75] text-white">
        <div className="mx-auto flex max-w-[1200px] items-center px-4">
          {/* Category Dropdown */}
          <button
            type="button"
            className="flex items-center gap-2 border-r border-white/20 py-2.5 pr-4 text-[13px] font-semibold transition hover:bg-white/10"
          >
            <Menu className="h-4 w-4" />
            Danh mục
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {/* Nav Links */}
          <nav className="hidden items-center lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3.5 py-2.5 text-[13px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto hidden lg:block">
            <Link
              href="/product?sale=true"
              className="px-3.5 py-2.5 text-[13px] font-medium text-white/85 transition hover:text-white"
            >
              Mã giảm giá
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[#e0e0e0] bg-white shadow-lg lg:hidden">
          <div className="mx-auto max-w-[1200px] px-4 py-2">
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-[#f0f0f0] px-3 py-2.5 text-[13px] font-medium text-[#333] transition last:border-0 hover:bg-[#f7f7f7] hover:text-[#004d75]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
