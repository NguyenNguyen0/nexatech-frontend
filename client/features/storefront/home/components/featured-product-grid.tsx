'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronRight } from 'lucide-react';
import { getUserIdFromAccessToken } from '@/features/auth/utils/auth-session';
import { authStorage } from '@/features/auth/utils/auth-storage';
import {
  fetchFeaturedProducts,
  fetchPopularRecommendations,
  fetchUserRecommendations,
} from '@/features/products/services/products-api';
import { ProductCard } from '@/features/products/components/product-card';
import type { ProductMinimal } from '@/features/products/types';

const HOME_RECOMMEND_LIMIT = 8;

export function FeaturedProductGrid() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<ProductMinimal[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionUserId = useMemo(() => {
    if (typeof session?.user?.id === 'string' && session.user.id.trim()) {
      return session.user.id;
    }

    return null;
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'loading') return;

    let active = true;

    const loadRecommendations = async () => {
      setLoading(true);

      const tokenUserId = getUserIdFromAccessToken(authStorage.getAccessToken());
      const resolvedUserId = sessionUserId ?? tokenUserId;

      try {
        let nextProducts: ProductMinimal[] = [];

        if (resolvedUserId) {
          nextProducts = await fetchUserRecommendations(resolvedUserId, HOME_RECOMMEND_LIMIT).catch(() => []);
        }

        if (nextProducts.length === 0) {
          nextProducts = await fetchPopularRecommendations(HOME_RECOMMEND_LIMIT).catch(() => []);
        }

        if (nextProducts.length === 0) {
          const featured = await fetchFeaturedProducts({ size: HOME_RECOMMEND_LIMIT, page: 0, sort: 'createdAt,desc' }).catch(
            () => ({ items: [] as ProductMinimal[] }),
          );
          nextProducts = featured.items;
        }

        if (!active) return;
        setProducts(nextProducts.slice(0, HOME_RECOMMEND_LIMIT));
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    void loadRecommendations();

    return () => {
      active = false;
    };
  }, [sessionUserId, status]);

  return (
    <section className="mx-auto w-full max-w-container-max px-4 py-5">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-bold text-on-surface">Gợi ý cho bạn</h2>
        <Link
          href="/product"
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-storefront-primary transition hover:underline"
        >
          Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: HOME_RECOMMEND_LIMIT }).map((_, index) => (
            <div key={index} className="aspect-[0.8] animate-pulse rounded-md border border-outline-variant bg-surface" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, HOME_RECOMMEND_LIMIT).map((product) => (
            <ProductCard key={product.id} product={product} variant="compact" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-outline-variant bg-surface px-4 py-8 text-sm text-on-surface-variant">
          Chưa có gợi ý sản phẩm để hiển thị.
        </div>
      )}
    </section>
  );
}
