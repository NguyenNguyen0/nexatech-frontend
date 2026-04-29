import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "host-app/components/home/Header";
import { Navbar } from "@/components/navbar";
import StoreProvider from "./StoreProvider";
import NProgressWrapper from "@/lib/nprogress-wrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Thanh toán | NexaTech",
  description: "Quản lý thanh toán NexaTech — Thanh toán và theo dõi giao dịch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#f5f5f7]">
        <Header />
        <StoreProvider>
          <NProgressWrapper>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </NProgressWrapper>
        </StoreProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
