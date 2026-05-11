import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductReviewSection } from '@/features/products/components/product-review-section';
import { fetchProductBySlug, fetchProductReviews, fetchRelatedProducts } from '@/features/products/services/products-api';
import type { PageResult, ProductReview } from '@/features/products/types';
import {
  PdpBreadcrumb,
  PdpBlogReview,
  PdpGallery,
  PdpSummary,
  PdpSpecs,
  PdpRelatedProducts,
} from '@/features/storefront/product-detail/components';

type RouteParams = Record<string, string | string[] | undefined>;

async function loadProduct(slug: string) {
  try {
    return await fetchProductBySlug(slug);
  } catch {
    return null;
  }
}

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

  const [relatedProducts, reviewsPage] = await Promise.all([
    fetchRelatedProducts(product.slug, product.id).catch(() => []),
    fetchProductReviews(product.slug, { page: 1, size: 10 }, product.id).catch(
      () => ({ items: [], page: 1, size: 10, totalItems: 0, totalPages: 1, hasNext: false } as PageResult<ProductReview>),
    ),
  ]);

  const gallery = product.images && product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PdpBreadcrumb categoryName={product.categoryName} brandName={product.brandName} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <PdpGallery images={gallery} productName={product.name} />
        <PdpSummary
          productId={product.id}
          name={product.name}
          slug={product.slug}
          categoryName={product.categoryName}
          brandName={product.brandName}
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          averageRating={product.averageRating}
          reviewCount={reviewsPage.totalItems ?? product.reviewCount ?? 0}
          stockStatus={product.stockStatus}
          stockQuantity={product.stockQuantity}
        />
      </div>

      <div className="mt-8 space-y-6">
        <PdpSpecs description={product.description} specs={product.specs} />

        <PdpBlogReview descriptionHtml={product.descriptionHtml} />

        <ProductReviewSection
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          averageRating={product.averageRating}
          reviewCount={reviewsPage.totalItems ?? reviewsPage.items.length}
          initialReviews={reviewsPage.items}
          initialHasNext={Boolean(
            typeof reviewsPage.hasNext === 'boolean'
              ? reviewsPage.hasNext
              : typeof reviewsPage.totalPages === 'number'
                ? reviewsPage.page < reviewsPage.totalPages
                : false,
          )}
        />

        <PdpRelatedProducts products={relatedProducts} />
      </div>
    </section>
  );
}
