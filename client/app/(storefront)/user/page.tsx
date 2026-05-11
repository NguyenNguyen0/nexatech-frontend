import type { Metadata } from 'next';
import { Bell, KeyRound, Settings2 } from 'lucide-react';
import {
  AccountAddressBook,
  AccountOrderHistory,
  AccountProfilePanel,
  AccountSidebar,
} from '@/features/storefront/account/components';
import { SectionContainer } from '@/features/storefront/shared/components/section-container';
import { SectionHeading } from '@/features/storefront/shared/components/section-heading';

export const metadata: Metadata = { title: 'Tài khoản' };

const demoOrders = [
  {
    id: 'NT240501',
    createdAt: '01/05/2026',
    status: 'Đang giao hàng',
    totalAmount: 12990000,
  },
  {
    id: 'NT240428',
    createdAt: '28/04/2026',
    status: 'Đã giao thành công',
    totalAmount: 4590000,
  },
];

const demoAddresses = [
  {
    id: 'addr-home',
    label: 'Nhà riêng',
    receiver: 'Khách hàng NexaTech',
    phone: '0901 234 567',
    addressLine: '12 Nguyễn Văn A, Phường 7, Quận 3, TP.HCM',
    isDefault: true,
  },
  {
    id: 'addr-office',
    label: 'Văn phòng',
    receiver: 'Khách hàng NexaTech',
    phone: '0901 234 567',
    addressLine: '98 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP.HCM',
  },
];

export default function UserPage() {
  return (
    <SectionContainer className="py-8 sm:py-10">
      <SectionHeading
        kicker="Account"
        title="Trang cá nhân"
        description="Quản lý thông tin tài khoản, theo dõi đơn hàng và cập nhật địa chỉ giao nhận trong một không gian thống nhất."
        className="mb-6"
      />

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
        <AccountSidebar active="profile" />

        <div className="space-y-6">
          <AccountProfilePanel
            fullName="Khách hàng NexaTech"
            email="customer@nexatech.vn"
            phone="0901 234 567"
            memberSince="05/2024"
          />
          <AccountOrderHistory orders={demoOrders} />
          <AccountAddressBook addresses={demoAddresses} />

          <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text-primary">Mở rộng cài đặt</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-border bg-bg-base px-4 py-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Settings2 className="h-4 w-4 text-primary" />
                  Cài đặt tài khoản
                </p>
                <p className="mt-1 text-xs text-text-secondary">Quản lý thông tin hồ sơ, avatar và tùy chọn hiển thị.</p>
              </article>

              <article className="rounded-2xl border border-border bg-bg-base px-4 py-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Mật khẩu & bảo mật
                </p>
                <p className="mt-1 text-xs text-text-secondary">Đổi mật khẩu, quản lý thiết bị và xác thực 2 lớp.</p>
              </article>

              <article className="rounded-2xl border border-border bg-bg-base px-4 py-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Bell className="h-4 w-4 text-primary" />
                  Thông báo
                </p>
                <p className="mt-1 text-xs text-text-secondary">Thiết lập email/sms cho trạng thái đơn hàng và ưu đãi.</p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </SectionContainer>
  );
}
