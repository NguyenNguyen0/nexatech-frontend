import {
  CategoryGrid,
  FeaturedProductGrid,
  FlashSaleStrip,
  HeroBanner,
  TrustStrip,
} from '@/features/storefront/home/components';

export function HomeShowcase() {
  return (
    <div className="overflow-x-hidden bg-bg-base">
      <HeroBanner />
      <FlashSaleStrip />
      <CategoryGrid />
      <FeaturedProductGrid />
      <TrustStrip />
    </div>
  );
}
