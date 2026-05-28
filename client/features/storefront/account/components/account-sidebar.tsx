'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Heart, KeyRound, Monitor, ReceiptText, ShieldCheck, UserRound } from 'lucide-react';

const links = [
  { key: 'profile', label: 'Hồ sơ', href: '/user', icon: UserRound, exact: true },
  { key: 'account', label: 'Tài khoản', href: '/user/account', icon: KeyRound, exact: false },
  { key: 'orders', label: 'Lịch sử đơn hàng', href: '/user/orders', icon: ReceiptText, exact: false },
  { key: 'appearance', label: 'Giao diện', href: '/user/appearance', icon: Monitor, exact: false },
  { key: 'notifications', label: 'Thông báo', href: '/user/notifications', icon: Bell, exact: false },
  { key: 'wishlist', label: 'Yêu thích', href: '/user/wishlist', icon: Heart, exact: false },
  { key: 'sessions', label: 'Phiên đăng nhập', href: '/user/sessions', icon: ShieldCheck, exact: false },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="rounded-[8px] border border-outline-variant bg-surface p-4 shadow-sm font-body-md">
      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={[
                'group flex items-center gap-3 rounded-[8px] border px-3 py-2.5 text-body-md transition',
                active
                  ? 'border-primary/60 bg-primary/10 font-title-lg text-primary shadow-sm'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/60 hover:text-primary',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-flex h-7 w-7 items-center justify-center rounded-[8px] border transition',
                  active
                    ? 'border-primary/30 bg-primary/15 text-primary'
                    : 'border-outline-variant text-on-surface-variant group-hover:border-primary/30 group-hover:text-primary',
                ].join(' ')}
              >
                <Icon className="h-4 w-4 shrink-0" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
