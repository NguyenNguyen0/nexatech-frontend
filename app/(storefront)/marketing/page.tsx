import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Khuyến mãi' };

export default function MarketingPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-transition">
      <h1 className="text-3xl font-bold mb-4">Khuyến mãi</h1>
      <p className="text-muted-foreground">Trang khuyến mãi — đang phát triển.</p>
    </div>
  );
}
