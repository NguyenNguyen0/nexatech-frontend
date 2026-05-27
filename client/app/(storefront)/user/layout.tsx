import type { ReactNode } from 'react';
import { AccountSidebar } from '@/features/storefront/account/components';
import { SectionContainer } from '@/features/storefront/shared/components/section-container';
import { SectionHeading } from '@/features/storefront/shared/components/section-heading';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <SectionContainer className="py-8 sm:py-10 font-body-md">
      <SectionHeading
        kicker="Account"
        title="Cài đặt tài khoản"
        description="Quản lý hồ sơ, bảo mật, giao diện và phiên đăng nhập của bạn."
        className="mb-8"
      />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <AccountSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </SectionContainer>
  );
}
