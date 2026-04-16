import type { Metadata } from 'next';
import { Header } from '@/components/home/Header';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickLinks } from '@/components/home/QuickLinks';
import { FlashSale } from '@/components/home/FlashSale';
import { ProductSection } from '@/components/home/ProductSection';
import { Footer } from '@/components/home/Footer';

export const metadata: Metadata = {
    title: 'Nexatech',
    description: 'Bản sao trang chủ Nexatech',
};

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#f3f4f6]">
            <Header />
            <main className="flex-1 pb-10">
                <HeroSection />
                <QuickLinks />
                <FlashSale />
                <ProductSection />
            </main>
            <Footer />
        </div>
    );
}
