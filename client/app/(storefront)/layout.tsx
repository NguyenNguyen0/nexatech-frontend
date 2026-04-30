import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f3f4f6]">
      <Header />
      <main className="flex-1 pb-10">{children}</main>
      <Footer />
    </div>
  );
}
