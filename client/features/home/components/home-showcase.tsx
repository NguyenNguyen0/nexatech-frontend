import {
  CategoryGrid,
  FeaturedProductGrid,
  FlashSaleStrip,
  HeroBanner,
  PromoBanner,
  TechNews,
  TrustStrip,
} from '@/features/storefront/home/components';
import { fetchFlashSaleStripData } from '@/features/flash-sale/services/flash-sale-strip-loader';

export async function HomeShowcase() {
  const flashSaleData = await fetchFlashSaleStripData();

  return (
    <div className="overflow-x-hidden bg-surface-container-lowest">
      <HeroBanner />
      <FlashSaleStrip items={flashSaleData.items} endsAt={flashSaleData.endsAt} />
      <CategoryGrid />
      <FeaturedProductGrid />
      <PromoBanner />
      <TechNews />
      <TrustStrip />
    </div>
  );
}
