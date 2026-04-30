import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tài khoản' };

export default function UserPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-transition">
      <h1 className="text-3xl font-bold mb-4">Tài khoản</h1>
      <p className="text-muted-foreground">Trang tài khoản — đang phát triển.</p>
    </div>
  );
}
