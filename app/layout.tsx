import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/shared/theme-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Nexatech',
    default: 'Nexatech — Thương mại điện tử số 1 Việt Nam',
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            duration={3000}
            closeButton
            position="top-center"
            richColors
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
