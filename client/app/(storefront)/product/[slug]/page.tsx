/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, ShieldCheck, Star } from 'lucide-react';
import { ProductCard } from '@/features/products/components/product-card';
import { ProductReviewSection } from '@/features/products/components/product-review-section';
import { fetchProductBySlug, fetchProductReviews, fetchRelatedProducts } from '@/features/products/services/products-api';
import type { PageResult, ProductReview } from '@/features/products/types';
import { formatCurrency } from '@/lib/utils';

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
    fetchRelatedProducts(product.id).catch(() => []),
    fetchProductReviews(product.id, { page: 1, size: 10 }).catch(
      () => ({ items: [], page: 1, size: 10, totalItems: 0, totalPages: 1, hasNext: false } as PageResult<ProductReview>),
    ),
  ]);

  const gallery = product.images && product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3 text-sm text-text-secondary">
        <Link href="/product" className="inline-flex items-center gap-2 transition hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <span>•</span>
        <span>{product.categoryName ?? 'Danh mục'}</span>
        <span>•</span>
        <span>{product.brandName ?? 'Thương hiệu'}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-bg-elevated shadow-sm">
            <div className="aspect-square bg-bg-sunken">
              {gallery[0] ? (
                <img src={gallery[0]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-black text-primary">NT</div>
              )}
            </div>
          </div>

          {gallery.length > 1 ? (
            <div className="grid grid-cols-3 gap-3">
              {gallery.slice(0, 3).map((image) => (
                <div key={image} className="overflow-hidden rounded-2xl border border-border bg-bg-elevated">
                  <img src={image} alt={product.name} className="aspect-square w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6 rounded-[2rem] border border-border bg-bg-elevated p-6 shadow-sm">
          <div className="space-y-4 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
              <span>{product.categoryName ?? 'Danh mục'}</span>
              <span>•</span>
              <span>{product.brandName ?? 'Thương hiệu'}</span>
            </div>

            <h1 className="font-display text-3xl font-black text-text-primary">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <div className="text-3xl font-black text-primary">{formatCurrency(product.price)}</div>
                {typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price ? (
                  <div className="text-sm text-text-tertiary line-through">{formatCurrency(product.compareAtPrice)}</div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2 text-sm font-semibold text-warning-dark">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {typeof product.averageRating === 'number' ? product.averageRating.toFixed(1) : '0.0'}
              </div>

              {product.stockStatus ? (
                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {product.stockStatus}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2 rounded-full bg-bg-base px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                {typeof product.stockQuantity === 'number' ? `${product.stockQuantity} sản phẩm còn lại` : 'Tồn kho theo thời gian thực'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-bg-base px-3 py-2">
                <Heart className="h-4 w-4 text-danger" />
                Ưu đãi, mô tả và ảnh được lấy từ API mới
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">Mô tả sản phẩm</h2>
            {product.descriptionHtml ? (
              <div
                className="prose prose-sm max-w-none text-text-secondary prose-headings:text-text-primary prose-p:text-text-secondary"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <p className="whitespace-pre-line text-sm leading-7 text-text-secondary">
                {product.description ?? 'Chưa có mô tả chi tiết cho sản phẩm này.'}
              </p>
            )}
          </div>

          <div className="grid gap-3 rounded-[1.5rem] border border-border bg-bg-base p-4 text-sm text-text-secondary sm:grid-cols-2">
            <div className="rounded-2xl bg-bg-elevated px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Slug</p>
              <p className="mt-1 font-medium text-text-primary">{product.slug}</p>
            </div>
            <div className="rounded-2xl bg-bg-elevated px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Mã sản phẩm</p>
              <p className="mt-1 font-medium text-text-primary">{product.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/product"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-bg-base px-5 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
            >
              Xem thêm sản phẩm
            </Link>
            <Link
              href={`/search?keyword=${encodeURIComponent(product.name)}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Tìm tương tự
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <ProductReviewSection
          productId={product.id}
          productName={product.name}
          averageRating={product.averageRating}
          reviewCount={reviewsPage.totalItems ?? reviewsPage.items.length}
          initialReviews={reviewsPage.items}
        />

        <section className="rounded-[2rem] border border-border bg-bg-elevated p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Related</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-text-primary">Sản phẩm liên quan</h2>
            </div>

            <Link href="/product" className="text-sm font-semibold text-primary transition hover:text-primary-dark">
              Xem catalog
            </Link>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-border bg-bg-base px-6 py-10 text-center text-sm text-text-secondary">
              Chưa có sản phẩm liên quan để hiển thị.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
