import Link from 'next/link';
import { Bell, KeyRound, Settings, UserRound } from 'lucide-react';

type AccountSidebarProps = {
  active?: 'profile' | 'orders' | 'addresses';
};

const links = [
  { key: 'profile', label: 'Thông tin cá nhân', href: '/user', icon: UserRound },
  { key: 'orders', label: 'Lịch sử đơn hàng', href: '/user#orders', icon: Settings },
  { key: 'addresses', label: 'Sổ địa chỉ', href: '/user#addresses', icon: Bell },
] as const;

export function AccountSidebar({ active = 'profile' }: AccountSidebarProps) {
  return (
    <aside className="rounded-4xl border border-border bg-bg-elevated p-4 shadow-sm">
      <div className="rounded-3xl bg-(image:--gradient-brand) px-4 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Account</p>
        <p className="mt-2 font-display text-xl font-bold">NexaTech Profile</p>
        <p className="mt-1 text-sm text-white/85">Quản lý thông tin, đơn hàng và địa chỉ giao nhận.</p>
      </div>

      <nav className="mt-4 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition',
                isActive
                  ? 'border-primary bg-primary/10 font-semibold text-primary'
                  : 'border-border bg-bg-base text-text-secondary hover:border-primary hover:text-primary',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-border bg-bg-base p-3 text-xs text-text-secondary">
        <p className="inline-flex items-center gap-1.5 font-semibold text-text-primary">
          <KeyRound className="h-3.5 w-3.5" />
          Sắp có
        </p>
        <p className="mt-1">Tùy chọn mật khẩu, thông báo và cài đặt nâng cao sẽ mở tại khu vực này.</p>
      </div>
    </aside>
  );
}
