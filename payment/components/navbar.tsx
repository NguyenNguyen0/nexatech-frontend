'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  CreditCard,
  Store,
  Package,
  User,
  LogIn,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';

function parseJwtClaims(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function getUserInfo(): { username: string | null; isAdmin: boolean } {
  if (typeof window === 'undefined') return { username: null, isAdmin: false };
  const token = localStorage.getItem('access_token');
  if (!token) return { username: null, isAdmin: false };
  const claims = parseJwtClaims(token);
  if (!claims) return { username: null, isAdmin: false };

  const username =
    (typeof claims.preferred_username === 'string' ? claims.preferred_username : null) ??
    (typeof claims.given_name === 'string' ? claims.given_name : null) ??
    (typeof claims.email === 'string' ? (claims.email as string).split('@')[0] : null);

  const realmRoles =
    (claims.realm_access as { roles?: string[] } | undefined)?.roles ?? [];
  const isAdmin = realmRoles.some(
    (r) => r === 'ADMIN' || r === 'admin' || r === 'ROLE_ADMIN',
  );

  return { username, isAdmin };
}

export function Navbar() {
  const pathname = usePathname();
  const [userInfo] = useState(() => getUserInfo());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paymentDropdown, setPaymentDropdown] = useState(false);

  const isPayment = !!pathname?.startsWith('/payment');

  const paymentSubLinks = [
    { href: '/payment', label: 'Lịch sử giao dịch', icon: <LayoutDashboard className="size-4" /> },
    { href: '/payment/initiate', label: 'Thanh toán mới', icon: <CreditCard className="size-4" /> },
  ];

  const adminSubLinks = [
    { href: '/payment/admin', label: 'Danh sách thanh toán', icon: <ShieldCheck className="size-4" /> },
    { href: '/payment/admin/stats', label: 'Thống kê & Doanh thu', icon: <BarChart3 className="size-4" /> },
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

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-0.5" aria-label="Điều hướng">
          <Link
            href="/product"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/5 transition-all duration-200 cursor-pointer"
          >
            <Store className="size-4" />
            Cửa hàng
          </Link>

          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/5 transition-all duration-200 cursor-pointer"
          >
            <Package className="size-4" />
            Đơn hàng
          </Link>

          {/* Thanh toán – with dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setPaymentDropdown(true)}
              onMouseLeave={() => setPaymentDropdown(false)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                isPayment
                  ? 'text-[#0071e3] bg-[#0071e3]/8'
                  : 'text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/5'
              }`}
            >
              <Wallet className="size-4" />
              Thanh toán
            </button>

            {paymentDropdown && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white/95 backdrop-blur-[20px] border border-black/10 rounded-2xl shadow-lg py-2"
                onMouseEnter={() => setPaymentDropdown(true)}
                onMouseLeave={() => setPaymentDropdown(false)}
              >
                {paymentSubLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      pathname === link.href
                        ? 'text-[#0071e3] bg-[#0071e3]/6'
                        : 'text-[#1d1d1f]/80 hover:text-[#0071e3] hover:bg-[#0071e3]/4'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}

                {userInfo.isAdmin && (
                  <>
                    <div className="mx-4 my-2 border-t border-black/8" />
                    <p className="text-[10px] uppercase tracking-wider text-[#6e6e73] px-4 pb-1.5">Quản trị</p>
                    {adminSubLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                          pathname?.startsWith(link.href)
                            ? 'text-[#0071e3] bg-[#0071e3]/6'
                            : 'text-[#1d1d1f]/80 hover:text-[#0071e3] hover:bg-[#0071e3]/4'
                        }`}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {userInfo.username ? (
            <Link
              href="/user"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors duration-200 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#0071e3]/10 flex items-center justify-center shrink-0">
                <User className="size-3.5 text-[#0071e3]" />
              </div>
              <span className="hidden sm:block max-w-30 truncate">{userInfo.username}</span>
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

          <button
            className="sm:hidden p-2 rounded-xl text-[#1d1d1f]/70 hover:bg-black/5 transition-colors cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-black/6 bg-white/92 backdrop-blur-[20px] px-4 py-3 space-y-1">
          <MobileLink href="/product" label="Cửa hàng" icon={<Store className="size-4" />} active={false} onClose={() => setMobileOpen(false)} />
          <MobileLink href="/orders" label="Đơn hàng" icon={<Package className="size-4" />} active={false} onClose={() => setMobileOpen(false)} />
          <div className="pt-1 pb-1">
            <p className="text-[11px] uppercase tracking-wider text-[#6e6e73] px-4 pb-1">Thanh toán</p>
            {paymentSubLinks.map((link) => (
              <MobileLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={pathname === link.href}
                onClose={() => setMobileOpen(false)}
              />
            ))}
          </div>
          {userInfo.isAdmin && (
            <div className="pt-1 pb-1">
              <p className="text-[11px] uppercase tracking-wider text-[#6e6e73] px-4 pb-1">Quản trị</p>
              {adminSubLinks.map((link) => (
                <MobileLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={!!pathname?.startsWith(link.href)}
                  onClose={() => setMobileOpen(false)}
                />
              ))}
            </div>
          )}
          {!userInfo.username && (
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

function MobileLink({
  href,
  label,
  icon,
  active,
  onClose,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
        active
          ? 'text-[#0071e3] bg-[#0071e3]/8'
          : 'text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/4'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}