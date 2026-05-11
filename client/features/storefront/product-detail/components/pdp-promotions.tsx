import { Gift, ShieldCheck, Ticket } from 'lucide-react';

const PROMOTION_ITEMS = [
  'Tặng balo gaming cao cấp trị giá 1.500.000đ',
  'Tặng chuột gaming không dây trị giá 990.000đ',
  'Giảm thêm 5% tối đa 1.000.000đ khi thanh toán VNPAY',
];

export function PdpPromotions() {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-bg-base">
      <header className="flex items-center gap-2 border-b border-border bg-bg-elevated px-4 py-3">
        <Gift className="h-5 w-5 text-danger" />
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-text-primary">Khuyến mãi và ưu đãi</h3>
      </header>

      <ul className="space-y-3 p-4">
        {PROMOTION_ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
            <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 border-t border-border bg-primary/5 px-4 py-3 text-xs font-medium text-text-secondary">
        <ShieldCheck className="h-4 w-4 text-success" />
        Quà tặng có thể thay đổi theo chương trình từng thời điểm.
      </div>
    </section>
  );
}
