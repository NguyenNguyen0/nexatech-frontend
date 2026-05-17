'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Monitor, Globe } from 'lucide-react';

const LANG_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English', disabled: true },
];

export default function AppearancePage() {
  const [lang, setLang] = useState('vi');

  const handleSave = () => {
    toast.success('Đã lưu tùy chọn (demo — chưa áp dụng thực tế)');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Giao diện</p>
            <h2 className="mt-1 text-xl font-bold text-text-primary">Tùy chỉnh hiển thị</h2>
            <p className="mt-0.5 text-sm text-text-secondary">Chọn phông chữ, giao diện và ngôn ngữ yêu thích.</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Language */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Globe className="h-4 w-4 text-primary" />
              Ngôn ngữ
            </label>
            <p className="mt-0.5 text-xs text-text-tertiary">Chọn ngôn ngữ hiển thị. Hỗ trợ đa ngôn ngữ đang phát triển.</p>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition"
            >
              {LANG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition"
            >
              Lưu tùy chọn
            </button>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-text-tertiary">
        Tính năng này đang ở giai đoạn thử nghiệm — thay đổi chưa được áp dụng thực tế.
      </p>
    </div>
  );
}
