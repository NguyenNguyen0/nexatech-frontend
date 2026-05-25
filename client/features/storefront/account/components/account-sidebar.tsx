'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Heart, KeyRound, Monitor, ShieldCheck, UserRound } from 'lucide-react';

const links = [
  { key: 'profile', label: 'Hồ sơ', href: '/user', icon: UserRound, exact: true },
  { key: 'account', label: 'Tài khoản', href: '/user/account', icon: KeyRound, exact: false },
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
    <aside className="rounded-4xl border border-border bg-bg-elevated p-4 shadow-sm">
      <nav className="mt-4 space-y-1.5">
        {links.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition',
                active
                  ? 'border-primary bg-primary/10 font-semibold text-primary'
                  : 'border-border bg-bg-base text-text-secondary hover:border-primary hover:text-primary',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
