import { fetchFlashSaleStripData } from '@/features/flash-sale/services/flash-sale-strip-loader';
import { FlashSalePage } from '@/features/storefront/flash-sale/components/flash-sale-page';

export const dynamic = 'force-dynamic';

export default async function FlashSaleRoute() {
  const data = await fetchFlashSaleStripData();
  return <FlashSalePage items={data.items} endsAt={data.endsAt} />;
}
