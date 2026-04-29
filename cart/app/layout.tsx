import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "host-app/components/home/Header";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Giỏ hàng | NexaTech",
  description: "Giỏ hàng mua sắm NexaTech — Công nghệ tốt nhất, giao nhanh nhất",
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
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
