import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AuthSessionProvider } from '@/components/providers/auth-session-provider';
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
  icons: {
    icon: '/brand/n-logo-transparent-bg.png',
    shortcut: '/brand/n-logo-transparent-bg.png',
    apple: '/brand/n-logo-transparent-bg.png',
  },
};

import { Suspense } from 'react';
import { ForceChangePasswordModal } from '@/components/custom/auth/force-change-password-modal';
import { GoogleRegistrationNotice } from '@/components/custom/auth/google-registration-notice';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/brand/n-logo-transparent-bg.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="/brand/n-logo-transparent-bg.png"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${beVietnamPro.className} antialiased`}
      >
        <AuthSessionProvider>
          {children}
          <Suspense fallback={null}>
            <GoogleRegistrationNotice />
          </Suspense>
          <ForceChangePasswordModal />
        </AuthSessionProvider>
        <Toaster duration={3000} />
      </body>
    </html>
  );
}
