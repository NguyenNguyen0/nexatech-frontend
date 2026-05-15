'use client';

import { ChevronDown, Heart, LogOut, Menu, ShoppingCart, Search, UserRound, X, KeyRound, ShieldCheck, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Laptop', href: '/product/collection/laptop' },
  { label: 'Gaming PC', href: '/product/collection/gaming-pc' },
  { label: 'Build PC', href: '/build-pc' },
  { label: 'Monitor', href: '/product/collection/monitor' },
  { label: 'Keyboard', href: '/product/collection/keyboard' },
  { label: 'Mouse', href: '/product/collection/mouse' },
  { label: 'Ghế', href: '/product/collection/chair' },
];

const STORAGE_KEY = 'nexatech_cart';
const WISHLIST_KEY = 'nexatech_wishlist';

function getCartCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const cart = JSON.parse(raw);
    return cart?.totalItems ?? 0;
  } catch {
    return 0;
  }
}

function getWishlistCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return 0;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
}

export function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [accountMenuOpen]);

  const handleLogout = async () => {
    setLogoutPending(true);
    try {
      await fetch('/api/auth/logout-keycloak', { method: 'POST' });
    } catch {
      /* vẫn signOut cục bộ */
    }
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut({ callbackUrl: '/' });
    setLogoutPending(false);
  };

  const refreshCounts = useCallback(() => {
    setCartCount(getCartCount());
    setWishlistCount(getWishlistCount());
  }, []);

  useEffect(() => {
    refreshCounts();
    window.addEventListener('cart-updated', refreshCounts);
    window.addEventListener('wishlist-updated', refreshCounts);
    window.addEventListener('storage', refreshCounts);
    return () => {
      window.removeEventListener('cart-updated', refreshCounts);
      window.removeEventListener('wishlist-updated', refreshCounts);
      window.removeEventListener('storage', refreshCounts);
    };
  }, [refreshCounts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-[480px] md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="h-[38px] w-full rounded-sm border border-primary bg-white px-3 pr-11 text-[13px] text-text-primary placeholder:text-[#a0a0a0] focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 flex h-[38px] w-10 items-center justify-center bg-primary text-white transition hover:bg-primary-dark"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {status === 'loading' ? (
                <div className="flex h-9 w-9 items-center justify-center rounded" aria-hidden>
                  <UserRound className="h-[18px] w-[18px] animate-pulse text-[#ccc]" />
                </div>
              ) : session ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((o) => !o)}
                    className="flex h-9 w-9 items-center justify-center rounded text-[#333] transition hover:bg-[#f0f0f0]"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Tài khoản"
                  >
                    <UserRound className="h-[18px] w-[18px]" />
                  </button>
                  {accountMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 z-50 mt-1 min-w-[210px] rounded-xl border border-[#e8e8e8] bg-white py-1.5 text-[13px] shadow-xl"
                    >
                      {/* User info header */}
                      {session.user?.name && (
                        <div className="px-3 pb-1.5 pt-1 border-b border-[#f0f0f0] mb-1">
                          <p className="font-semibold text-[#1b1c1c] truncate">{session.user.name}</p>
                          {session.user.email && (
                            <p className="text-[11px] text-[#888] truncate">{session.user.email}</p>
                          )}
                        </div>
                      )}

                      <Link
                        href="/user"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-[#333] transition hover:bg-[#f5f5f5]"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <UserRound className="h-3.5 w-3.5 shrink-0 text-primary" />
                        Hồ sơ cá nhân
                      </Link>

                      <Link
                        href="/user/account"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-[#333] transition hover:bg-[#f5f5f5]"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <KeyRound className="h-3.5 w-3.5 shrink-0 text-primary" />
                        Đổi mật khẩu
                      </Link>

                      <Link
                        href="/user/sessions"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-[#333] transition hover:bg-[#f5f5f5]"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                        Phiên đăng nhập
                      </Link>

                      <Link
                        href="/user/notifications"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-[#333] transition hover:bg-[#f5f5f5]"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <Settings className="h-3.5 w-3.5 shrink-0 text-primary" />
                        Cài đặt
                      </Link>

                      <div className="my-1 border-t border-[#f0f0f0]" />

                      <button
                        type="button"
                        role="menuitem"
                        disabled={logoutPending}
                        onClick={() => void handleLogout()}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[#e30019] transition hover:bg-[#fff5f5] disabled:opacity-50"
                      >
                        <LogOut className="h-3.5 w-3.5 shrink-0" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center rounded border border-primary bg-primary px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-primary-dark"
                >
                  Đăng nhập
                </Link>
              )}

              <Link
                href="/user/wishlist"
                className="relative hidden rounded p-2 text-[#333] transition hover:bg-[#f0f0f0] sm:flex"
              >
                <Heart className="h-[18px] w-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e30019] px-0.5 text-[9px] font-bold text-white">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center rounded p-2 text-[#333] transition hover:bg-[#f0f0f0]"
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e30019] px-0.5 text-[9px] font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
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
        </div>

        {/* Mobile Search */}
        <div className="border-t border-[#e0e0e0] px-4 py-2 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="h-9 w-full rounded-sm border border-primary bg-white px-3 pr-10 text-[13px] placeholder:text-[#a0a0a0] focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center bg-primary text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Second Tier - Category Navigation */}
      <div className="bg-primary text-white">
        <div className="mx-auto flex max-w-[1200px] items-center px-4">
          {/* Category Dropdown Button */}
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
              {status === 'loading' ? (
                <div className="border-b border-[#f0f0f0] px-3 py-2.5 text-[13px] text-[#999]">
                  Đang tải…
                </div>
              ) : session ? (
                <>
                  <Link
                    href="/user"
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-[#f0f0f0] px-3 py-2.5 text-[13px] font-medium text-[#333] flex items-center gap-2 hover:bg-[#f7f7f7]"
                  >
                    <UserRound className="h-4 w-4 text-[#004d75]" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    href="/user/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-[#f0f0f0] px-3 py-2.5 text-[13px] font-medium text-[#333] flex items-center gap-2 hover:bg-[#f7f7f7]"
                  >
                    <KeyRound className="h-4 w-4 text-[#004d75]" />
                    Đổi mật khẩu
                  </Link>
                  <Link
                    href="/user/sessions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-[#f0f0f0] px-3 py-2.5 text-[13px] font-medium text-[#333] flex items-center gap-2 hover:bg-[#f7f7f7]"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#004d75]" />
                    Phiên đăng nhập
                  </Link>
                  <button
                    type="button"
                    disabled={logoutPending}
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-2 border-b border-[#f0f0f0] px-3 py-2.5 text-left text-[13px] font-medium text-[#e30019] hover:bg-[#fff5f5] disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-[#f0f0f0] px-3 py-2.5 text-[13px] font-medium text-[#004d75] hover:bg-[#f7f7f7]"
                >
                  Đăng nhập
                </Link>
              )}
              <Link
                href="/user/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-[13px] font-medium text-[#333] flex items-center gap-2 hover:bg-[#f7f7f7]"
              >
                <Heart className="h-4 w-4" />
                Yêu thích {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
