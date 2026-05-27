import Image from 'next/image';
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
    <div className="relative overflow-x-hidden bg-surface-container-lowest">
      <div className="pointer-events-none fixed left-3 top-[118px] z-30 hidden 2xl:block">
        <Image
          src="/home/left_banner.jpg"
          alt="NexaTech shopping banner"
          width={180}
          height={256}
          priority
          className="max-h-[calc(100vh-150px)] w-[clamp(128px,9vw,180px)] rounded-lg border border-white/70 object-contain shadow-lg"
        />
      </div>
      <div className="pointer-events-none fixed right-3 top-[118px] z-30 hidden 2xl:block">
        <Image
          src="/home/right_banner.png"
          alt="NexaTech shopping banner"
          width={180}
          height={256}
          priority
          className="max-h-[calc(100vh-150px)] w-[clamp(128px,9vw,180px)] rounded-lg border border-white/70 object-contain shadow-lg"
        />
      </div>
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
