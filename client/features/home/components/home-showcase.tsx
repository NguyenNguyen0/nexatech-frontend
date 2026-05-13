import {
  CategoryGrid,
  FeaturedProductGrid,
  FlashSaleStrip,
  HeroBanner,
  PromoBanner,
  TechNews,
  TrustStrip,
} from '@/features/storefront/home/components';

export function HomeShowcase() {
  return (
    <div className="overflow-x-hidden bg-[#fbf9f8]">
      <HeroBanner />
      <FlashSaleStrip />
      <CategoryGrid />
      <FeaturedProductGrid />
      <PromoBanner />
      <TechNews />
      <TrustStrip />
    </div>
  );
}
