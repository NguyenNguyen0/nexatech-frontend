'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, ShoppingBag, Tag } from 'lucide-react';

type NotifyType = 'all' | 'direct' | 'none';

interface EmailToggle {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EMAIL_TOGGLES: EmailToggle[] = [
  {
    key: 'communication',
    label: 'Email thông báo',
    description: 'Nhận email về hoạt động tài khoản và đơn hàng.',
    icon: Mail,
  },
  {
    key: 'marketing',
    label: 'Email marketing',
    description: 'Nhận thông tin về sản phẩm mới, tính năng và ưu đãi.',
    icon: Tag,
  },
  {
    key: 'order',
    label: 'Trạng thái đơn hàng',
    description: 'Nhận email cập nhật trạng thái vận chuyển và giao hàng.',
    icon: ShoppingBag,
  },
  {
    key: 'social',
    label: 'Email xã hội',
    description: 'Nhận email về đánh giá sản phẩm và tương tác cộng đồng.',
    icon: MessageSquare,
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={[
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-border',
      ].join(' ')}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={[
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-4.5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const [notifyType, setNotifyType] = useState<NotifyType>('direct');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    communication: false,
    marketing: false,
    order: true,
    social: false,
  });

  const handleSave = () => {
    toast.success('Đã lưu cài đặt thông báo (demo — chưa áp dụng thực tế)');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-bg-elevated p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Thông báo</p>
            <h2 className="mt-1 text-xl font-bold text-text-primary">Cài đặt thông báo</h2>
            <p className="mt-0.5 text-sm text-text-secondary">Chọn cách bạn muốn nhận thông báo từ NexaTech.</p>
          </div>
        </div>

        {/* Notify type */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-text-primary">Thông báo đẩy</p>
          <p className="mt-0.5 text-xs text-text-tertiary">Thông báo tức thì khi có hoạt động liên quan đến tài khoản.</p>
          <div className="mt-3 space-y-2">
            {([
              { value: 'all', label: 'Tất cả thông báo mới' },
              { value: 'direct', label: 'Tin nhắn trực tiếp và đề cập' },
              { value: 'none', label: 'Không nhận thông báo' },
            ] as { value: NotifyType; label: string }[]).map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-bg-base px-4 py-3 hover:border-primary/40 transition">
                <input
                  type="radio"
                  name="notifyType"
                  value={o.value}
                  checked={notifyType === o.value}
                  onChange={() => setNotifyType(o.value)}
                  className="accent-primary"
                />
                <span className="text-sm text-text-primary">{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Email toggles */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-text-primary">Email thông báo</p>
          <p className="mt-0.5 text-xs text-text-tertiary">Chọn loại email bạn muốn nhận.</p>
          <div className="mt-3 space-y-2">
            {EMAIL_TOGGLES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-md border border-border bg-bg-base px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.label}</p>
                      <p className="text-xs text-text-tertiary">{item.description}</p>
                    </div>
                  </div>
                  <Toggle
                    checked={toggles[item.key]}
                    onChange={() => setToggles((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition"
          >
            Lưu cài đặt
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-text-tertiary">
        Tính năng này đang ở giai đoạn thử nghiệm — thay đổi chưa được áp dụng thực tế.
      </p>
    </div>
  );
}
