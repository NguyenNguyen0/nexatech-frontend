import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense, cache } from 'react';
import { ProductReviewSection } from '@/features/products/components/product-review-section';
import { fetchProductBySlug, fetchProductReviews } from '@/features/products/services/products-api';
import type { PageResult, ProductReview } from '@/features/products/types';
import { fetchFlashSaleByProductSlug } from '@/features/flash-sale/services/flash-sale-strip-loader';
import {
  PdpBreadcrumb,
  PdpBlogReview,
  PdpGallery,
  PdpRelatedProductsFallback,
  PdpRelatedProductsSection,
  PdpSummary,
  PdpSpecs,
} from '@/features/storefront/product-detail/components';

type RouteParams = Record<string, string | string[] | undefined>;

const loadProduct = cache(async (slug: string) => {
  try {
    return await fetchProductBySlug(slug);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params?: Promise<RouteParams> }): Promise<Metadata> {
  const resolvedParams = (await params) ?? {};
  const slug = typeof resolvedParams.slug === 'string' ? resolvedParams.slug : Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : '';
  const product = slug ? await loadProduct(slug) : null;

  return {
    title: product?.name ?? 'Chi tiết sản phẩm',
    description: product?.description ?? 'Thông tin chi tiết sản phẩm, đánh giá và sản phẩm liên quan.',
  };
}

export default async function ProductDetailPage({ params }: { params?: Promise<RouteParams> }) {
  const resolvedParams = (await params) ?? {};
  const slug = typeof resolvedParams.slug === 'string' ? resolvedParams.slug : Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : '';

  if (!slug) {
    notFound();
  }

  const product = await loadProduct(slug);

  if (!product) {
    notFound();
  }

  const reviewsPage = await fetchProductReviews(product.slug, { page: 0, size: 10 }, product.id).catch(
      () => ({ items: [], page: 0, size: 10, totalItems: 0, totalPages: 0, hasNext: false } as PageResult<ProductReview>),
    );

  const gallery = product.images && product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const categoryName = product.primaryCategoryName;
  const activeFlashSale = await fetchFlashSaleByProductSlug(product.slug, product.id);
  const displayPrice = activeFlashSale?.salePrice ?? product.price;
  const displayCompareAtPrice = activeFlashSale?.originalPrice ?? product.compareAtPrice;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <PdpBreadcrumb categoryName={categoryName} brandName={product.brandName} />

      <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:items-start mb-12">
        <PdpGallery images={gallery} productName={product.name} />
        <div className="w-full lg:w-[420px] lg:shrink-0">
          <PdpSummary
            productId={product.id}
            name={product.name}
            slug={product.slug}
            categoryName={categoryName}
            categoryIds={product.categoryIds}
            brandName={product.brandName}
            brandId={product.brandId}
            price={displayPrice}
            compareAtPrice={displayCompareAtPrice}
            flashSaleId={activeFlashSale?.id}
            flashSalePrice={activeFlashSale?.salePrice}
            averageRating={product.averageRating}
            reviewCount={reviewsPage.totalItems ?? product.reviewCount ?? 0}
            stockStatus={product.stockStatus}
            stockQuantity={product.stockQuantity}
            thumbnail={product.thumbnail ?? (product.images?.[0])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <PdpBlogReview descriptionHtml={product.descriptionHtml} />

          <ProductReviewSection
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            categoryIds={product.categoryIds}
            brandId={product.brandId}
            price={displayPrice}
            averageRating={product.averageRating}
            reviewCount={reviewsPage.totalItems ?? reviewsPage.items.length}
            initialReviews={reviewsPage.items}
            initialHasNext={Boolean(
              typeof reviewsPage.hasNext === 'boolean'
                ? reviewsPage.hasNext
                : typeof reviewsPage.totalPages === 'number'
                  ? (reviewsPage.page ?? 0) + 1 < reviewsPage.totalPages
                  : false,
            )}
          />
        </div>
        
        <div className="col-span-1 lg:col-span-1">
          <PdpSpecs description={product.description} specs={product.specs} />
        </div>
      </div>

      <div className="mt-12">
        <Suspense fallback={<PdpRelatedProductsFallback />}>
          <PdpRelatedProductsSection productId={product.id} />
        </Suspense>
      </div>
    </section>
  );
}
