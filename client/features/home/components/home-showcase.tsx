import {
  CategoryGrid,
  FeaturedProductGrid,
  FlashSaleStrip,
  HeroBanner,
  TechNews,
  TrustStrip,
} from '@/features/storefront/home/components';
import { fetchFlashSaleStripData } from '@/features/flash-sale/services/flash-sale-strip-loader';

export async function HomeShowcase() {
  const flashSaleData = await fetchFlashSaleStripData();

  return (
    <div className="relative overflow-x-hidden bg-surface-container-lowest">
      <HeroBanner />
      <FlashSaleStrip items={flashSaleData.items} endsAt={flashSaleData.endsAt} />
      <CategoryGrid />
      <FeaturedProductGrid />
      <TechNews />
      <TrustStrip />
    </div>
  );
}
