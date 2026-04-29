'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Package, Store, User, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [username] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          return (
            payload.preferred_username ??
            payload.given_name ??
            (typeof payload.email === 'string' ? payload.email.split('@')[0] : null)
          );
        }
      }
    } catch {
      // ignore JWT parse errors
    }
    return null;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCart = !!pathname?.startsWith('/cart');
  const isOrder =
    !!pathname?.startsWith('/order') || !!pathname?.startsWith('/orders') || !!pathname?.startsWith('/products');

  const navLinks = [
    { href: '/product', label: 'Cửa hàng', icon: <Store className="size-4" />, active: false },
    { href: '/cart', label: 'Giỏ hàng', icon: <ShoppingBag className="size-4" />, active: isCart },
    { href: '/order', label: 'Đơn hàng', icon: <Package className="size-4" />, active: isOrder },
  ];

  return (
    <header className="sticky top-0 z-900 bg-white/72 backdrop-blur-[20px] backdrop-saturate-180 border-b border-black/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 h-7 rounded-[8px] bg-[#0071e3] flex items-center justify-center">
            <span className="text-white font-bold text-[11px] leading-none">N</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors duration-200">
            NexaTech
          </span>
        </Link>

        {/* Desktop nav links — center */}
        <nav className="hidden sm:flex items-center gap-0.5" aria-label="Điều hướng">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                link.active
                  ? 'text-[#0071e3] bg-[#0071e3]/8'
                  : 'text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/5'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {username ? (
            <Link
              href="/user"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors duration-200 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#0071e3]/10 flex items-center justify-center shrink-0">
                <User className="size-3.5 text-[#0071e3]" />
              </div>
              <span className="hidden sm:block max-w-30 truncate">{username}</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors duration-200 cursor-pointer"
            >
              <LogIn className="size-4" />
              Đăng nhập
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-xl text-[#1d1d1f]/70 hover:bg-black/5 transition-colors cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-black/6 bg-white/92 backdrop-blur-[20px] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                link.active
                  ? 'text-[#0071e3] bg-[#0071e3]/8'
                  : 'text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/4'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {!username && (
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#0071e3] hover:bg-[#0071e3]/6 transition-all cursor-pointer"
            >
              <LogIn className="size-4" />
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
