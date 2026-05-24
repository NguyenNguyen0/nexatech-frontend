import { fetchRelatedProducts } from '@/features/products/services/products-api';
import { PdpRelatedProducts } from './pdp-related-products';

type PdpRelatedProductsSectionProps = {
  productSlug: string;
  productId: string;
};

export async function PdpRelatedProductsSection({
  productSlug,
  productId,
}: PdpRelatedProductsSectionProps) {
  const products = await fetchRelatedProducts(productSlug, productId).catch(() => []);

  return <PdpRelatedProducts products={products} />;
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
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[0.8] animate-pulse rounded-md border border-outline-variant bg-surface-container"
          />
        ))}
      </div>
    </section>
  );
}
