import { Mail, Phone, ShieldCheck } from 'lucide-react';

type AccountProfilePanelProps = {
  fullName: string;
  email: string;
  phone: string;
  memberSince: string;
};

export function AccountProfilePanel({ fullName, email, phone, memberSince }: AccountProfilePanelProps) {
  return (
    <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Hồ sơ</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">{fullName}</h2>
          <p className="mt-1 text-sm text-text-secondary">Thành viên từ {memberSince}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
          <ShieldCheck className="h-3.5 w-3.5" />
          Tài khoản đã xác minh
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-base px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Email</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-text-primary">
            <Mail className="h-4 w-4 text-primary" />
            {email}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-base px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Số điện thoại</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-text-primary">
            <Phone className="h-4 w-4 text-primary" />
            {phone}
          </p>
        </div>
      </div>
    </section>
  );
}
