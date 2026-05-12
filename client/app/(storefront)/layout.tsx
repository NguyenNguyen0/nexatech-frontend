import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ChatWidget } from '@/components/shared/chat-widget';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col font-body bg-bg-base">
      <Header />
      <main className="flex-1 pb-10">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
