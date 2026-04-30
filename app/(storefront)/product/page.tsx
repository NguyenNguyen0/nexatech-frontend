import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sản phẩm' };

export default function ProductPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-transition">
      <h1 className="text-3xl font-bold mb-4">Sản phẩm</h1>
      <p className="text-muted-foreground">Trang sản phẩm — đang phát triển.</p>
    </div>
  );
}
