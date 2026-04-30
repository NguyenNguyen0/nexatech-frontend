import type { Metadata } from 'next';
import { HeroSection } from '@/features/home/components/hero-section';
import { QuickLinks } from '@/features/home/components/quick-links';
import { FlashSale } from '@/features/home/components/flash-sale';
import { ProductSection } from '@/features/home/components/product-section';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Nền tảng thương mại điện tử hàng đầu Việt Nam.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickLinks />
      <FlashSale />
      <ProductSection />
    </>
  );
}
