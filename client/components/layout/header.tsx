'use client';

import { ChevronDown, Heart, LogOut, Menu, ReceiptText, ShoppingCart, UserRound, X, KeyRound, ShieldCheck, Settings, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { CategoryDialog } from './category-dialog';
import { ProductSearch } from './product-search';

const navLinks = [
  { label: 'Laptop', href: '/product/collection/laptop' },
  { label: 'Laptop Gaming', href: '/product/collection/gaming-laptop' },
  { label: 'Build PC', href: '/build-pc' },
  { label: 'Màn hình', href: '/product/collection/monitor' },
  { label: 'Bàn phím', href: '/product/collection/keyboard' },
  { label: 'Chuột', href: '/product/collection/mouse' },
  { label: 'Ghế', href: '/product/collection/chair' },
];

const STORAGE_KEY = 'nexatech_cart';

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

export function Header() {
  const { data: session, status } = useSession();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount] = useState(0);
  const [logoutPending, setLogoutPending] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setShowAnnouncement(true);
      } else {
        setShowAnnouncement(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close category menu when account or mobile menu opens
  useEffect(() => {
    if (accountMenuOpen || mobileMenuOpen) {
      setCategoryMenuOpen(false);
    }
  }, [accountMenuOpen, mobileMenuOpen]);

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
    authStorage.clear();
    try {
      await fetch('/api/auth/logout-keycloak', { method: 'POST' });
    } catch {
      /* vẫn signOut cục bộ */
    }
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    setCategoryMenuOpen(false);
    await signOut({ callbackUrl: '/' });
    setLogoutPending(false);
  };

  const handleCategoryMenuToggle = useCallback(() => {
    setAccountMenuOpen(false);
    setCategoryMenuOpen((prev) => !prev);
  }, []);

  const refreshCounts = useCallback(() => {
    setCartCount(getCartCount());
  }, []);

  useEffect(() => {
    refreshCounts();
    window.addEventListener('cart-updated', refreshCounts);
    window.addEventListener('storage', refreshCounts);
    return () => {
      window.removeEventListener('cart-updated', refreshCounts);
      window.removeEventListener('storage', refreshCounts);
    };
  }, [refreshCounts]);

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
            <ProductSearch
              placeholder="Tìm kiếm sản phẩm..."
              formClassName="h-[38px] rounded-sm border-[#004d75] shadow-none"
            />
          </div>

          {/* Right Actions */}
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
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-[#004d75]" />
                      Hồ sơ cá nhân
                    </Link>

                    <Link
                      href="/user/orders"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-[#333] transition hover:bg-[#f5f5f5]"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <ReceiptText className="h-3.5 w-3.5 shrink-0 text-[#004d75]" />
                      Lịch sử đơn hàng
                    </Link>

                    <Link
                      href="/user/account"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-[#333] transition hover:bg-[#f5f5f5]"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <KeyRound className="h-3.5 w-3.5 shrink-0 text-[#004d75]" />
                      Đổi mật khẩu
                    </Link>

                    <Link
                      href="/user/sessions"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-[#333] transition hover:bg-[#f5f5f5]"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#004d75]" />
                      Phiên đăng nhập
                    </Link>

                    <Link
                      href="/user/notifications"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-[#333] transition hover:bg-[#f5f5f5]"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Settings className="h-3.5 w-3.5 shrink-0 text-[#004d75]" />
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
                className="inline-flex items-center rounded border border-[#004d75] bg-[#004d75] px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#003d5c]"
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

        {/* Mobile Search */}
        <div className="border-t border-[#e0e0e0] px-4 py-2 md:hidden">
          <ProductSearch
            placeholder="Tìm kiếm sản phẩm..."
            formClassName="h-9 rounded-sm border-[#004d75] shadow-none"
          />
        </div>
      </div>

      {/* Top Announcement Bar */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-[var(--color-primary)] text-white text-[12px] font-medium flex items-center ${showAnnouncement ? 'h-8 opacity-100 border-b border-white/10' : 'h-0 opacity-0 pointer-events-none'
          }`}
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center px-4">
          {/* Marquee Announcement */}
          <div className="flex-1 overflow-hidden relative mx-4">
            <div className="animate-marquee whitespace-nowrap py-1">
              <span className="inline-block pr-10">
                🔥 SIÊU BÃO CÔNG NGHỆ NEXATECH: Giảm tới 50% tất cả Laptop, PC Gaming, Màn hình & Linh kiện cao cấp! Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ. Hỗ trợ trả góp 0% lãi suất. Mua ngay! 🔥
              </span>
              <span className="inline-block pr-10">
                🔥 SIÊU BÃO CÔNG NGHỆ NEXATECH: Giảm tới 50% tất cả Laptop, PC Gaming, Màn hình & Linh kiện cao cấp! Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ. Hỗ trợ trả góp 0% lãi suất. Mua ngay! 🔥
              </span>
            </div>
          </div>

          {/* Right side links matching layout below */}
          <div className="ml-auto hidden lg:flex items-center shrink-0">
            <Link
              href="/user/orders"
              className="px-3.5 py-2 text-[11px] font-semibold text-white/95 transition hover:text-white flex items-center gap-1.5"
            >
              <ReceiptText className="h-3 w-3" />
              Tra cứu đơn hàng
            </Link>
            <span className="text-white/30 text-[10px] select-none">|</span>
            <a
              href="tel:18002097"
              className="px-3.5 py-2 text-[11px] font-semibold text-white/95 transition hover:text-white flex items-center gap-1.5"
            >
              <Phone className="h-3 w-3" />
              Hotline: 1800 2097
            </a>
          </div>
        </div>
      </div>

      {/* Second Tier - Category Navigation */}
      <div className="bg-[var(--color-primary)] text-white relative">
        <div className="mx-auto flex max-w-[1200px] items-center px-4">
          {/* Category Dropdown Button */}
          <button
            type="button"
            onClick={handleCategoryMenuToggle}
            onMouseEnter={() => !categoryMenuOpen && setCategoryMenuOpen(true)}
            className={`flex items-center gap-2 border-r border-white/20 py-2.5 px-4 text-[13px] font-semibold transition ${categoryMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            aria-expanded={categoryMenuOpen}
            aria-controls="category-menu"
          >
            <Menu className="h-4 w-4" />
            Danh mục
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''
              }`} />
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
            <Link
              href="/news"
              className="px-3.5 py-2.5 text-[13px] font-medium text-white/85 transition hover:text-white"
            >
              News
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
                    href="/user/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-[#f0f0f0] px-3 py-2.5 text-[13px] font-medium text-[#333] flex items-center gap-2 hover:bg-[#f7f7f7]"
                  >
                    <ReceiptText className="h-4 w-4 text-[#004d75]" />
                    Lịch sử đơn hàng
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

      {/* Category Dialog */}
      <div id="category-menu" className="relative">
        <CategoryDialog
          open={categoryMenuOpen}
          onClose={() => setCategoryMenuOpen(false)}
        />
      </div>
    </header>
  );
}
