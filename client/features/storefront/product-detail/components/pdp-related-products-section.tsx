import { fetchRecommendedProductsForPdp } from '@/features/products/services/products-api';
import { PdpRelatedProducts } from './pdp-related-products';

const PDP_RELATED_PRODUCTS_LIMIT = 8;

type PdpRelatedProductsSectionProps = {
  productId: string;
};

export async function PdpRelatedProductsSection({
  productId,
}: PdpRelatedProductsSectionProps) {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Recommend] PDP section start', { productId });
  }

  const products = await fetchRecommendedProductsForPdp(productId, PDP_RELATED_PRODUCTS_LIMIT).catch((error) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Recommend] PDP section failed', { productId, error });
    }
    return [];
  });

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Recommend] PDP section result', { productId, count: products.length });
  }

  return <PdpRelatedProducts products={products.slice(0, PDP_RELATED_PRODUCTS_LIMIT)} />;
}

export function PdpRelatedProductsFallback() {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-headline-md font-headline-md text-on-surface">Sản phẩm liên quan</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: PDP_RELATED_PRODUCTS_LIMIT }).map((_, index) => (
          <div
            key={index}
            className="aspect-[0.8] animate-pulse rounded-md border border-outline-variant bg-surface-container"
          />
        ))}
      </div>
    </section>
  );
}
