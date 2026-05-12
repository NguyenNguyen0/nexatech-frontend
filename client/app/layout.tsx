import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | NexaTech',
    default: 'NexaTech — Thương mại điện tử số 1 Việt Nam',
  },
  description:
    'Nền tảng thương mại điện tử hàng đầu Việt Nam với hàng ngàn ưu đãi hấp dẫn.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${beVietnamPro.className} antialiased`}
      >
        {children}
        <Toaster
          duration={3000}
          closeButton
          position="top-center"
          richColors
        />
      </body>
    </html>
  );
}
