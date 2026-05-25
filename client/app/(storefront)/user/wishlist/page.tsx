'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import {
  getWishlist,
  getWishlistErrorMessage,
  removeFromWishlist,
} from '@/features/wishlist/services/wishlist-api';
import type { WishlistProductItem } from '@/features/wishlist/types';
import { formatCurrency } from '@/lib/utils';

const PAGE_SIZE = 20;
const DEFAULT_SORT = 'createdAt,desc';

export default function WishlistPage() {
  const { refreshWishlist } = useWishlist();
  const [items, setItems] = useState<WishlistProductItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingById, setIsRemovingById] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canGoPrev = page > 0;
  const canGoNext = page < Math.max(0, totalPages - 1);

  const fetchWishlistPage = useCallback(async (nextPage: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getWishlist({
        page: nextPage,
        size: PAGE_SIZE,
        sort: DEFAULT_SORT,
      });

      setItems(data.content);
      setTotalPages(Math.max(1, data.totalPages));
      setTotalElements(data.totalElements);
      setPage(data.page);
    } catch (error) {
      setErrorMessage(getWishlistErrorMessage(error, 'Không thể tải danh sách yêu thích'));
      setItems([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWishlistPage(page);
  }, [fetchWishlistPage, page]);

  const handleRemove = useCallback(async (item: WishlistProductItem) => {
    setIsRemovingById((current) => ({ ...current, [item.id]: true }));

    try {
      await removeFromWishlist(item.id);
      toast.success(`Đã xóa "${item.name}" khỏi danh sách yêu thích`);

      await refreshWishlist();

      if (items.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        await fetchWishlistPage(page);
      }
    } catch (error) {
      toast.error(getWishlistErrorMessage(error, 'Không thể xóa sản phẩm khỏi wishlist'));
    } finally {
      setIsRemovingById((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
    }
  }, [fetchWishlistPage, items.length, page, refreshWishlist]);

  const pageLabel = useMemo(() => {
    if (totalElements === 0) return '0 sản phẩm';

    const start = page * PAGE_SIZE + 1;
    const end = Math.min((page + 1) * PAGE_SIZE, totalElements);
    return `${start}-${end} / ${totalElements} sản phẩm`;
  }, [page, totalElements]);

  return (
    <div className="grow bg-surface-container-low py-8">
      <div className="max-w-container-max mx-auto px-gutter">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/user" className="hover:text-primary">Tài khoản</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">Sản phẩm yêu thích</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-headline-md font-headline-md text-on-surface">Sản phẩm yêu thích</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">{pageLabel}</p>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-error/30 bg-error/5 px-5 py-6">
            <p className="text-body-md text-error">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void fetchWishlistPage(page)}
              className="mt-3 text-label-sm font-semibold text-primary hover:underline"
            >
              Thử lại
            </button>
          </div>
        ) : isLoading ? (
          <div className="rounded-2xl border border-outline-variant bg-surface px-5 py-12 flex items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải wishlist...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-24 bg-surface rounded-2xl border border-outline-variant">
            <span className="material-symbols-outlined text-[72px] text-outline">favorite</span>
            <div className="text-center">
              <p className="text-headline-sm font-headline-sm text-on-surface">Chưa có sản phẩm yêu thích</p>
              <p className="text-body-md text-on-surface-variant mt-2">Nhấn vào biểu tượng ❤️ trên sản phẩm để lưu lại.</p>
            </div>
            <Link
              href="/product"
              className="h-12 px-8 bg-primary text-on-primary rounded-xl font-bold inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <Link href={`/product/${item.slug}`} className="block relative aspect-square bg-surface-container overflow-hidden">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[48px] text-outline">inventory_2</span>
                    </div>
                  )}
                </Link>
                <div className="p-3 flex flex-col grow">
                  <Link href={`/product/${item.slug}`} className="text-label-sm font-medium text-on-surface line-clamp-2 mb-2 hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-body-sm font-bold text-primary">{formatCurrency(item.price)}</span>
                    <button
                      onClick={() => void handleRemove(item)}
                      disabled={isRemovingById[item.id] === true}
                      className="text-error hover:bg-error/10 rounded-full p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      title="Xóa khỏi yêu thích"
                    >
                      {isRemovingById[item.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!errorMessage && !isLoading && totalElements > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={!canGoPrev}
              className="h-10 px-4 rounded-xl border border-outline-variant text-label-sm font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
            >
              Trước
            </button>
            <span className="text-label-sm text-on-surface-variant">
              Trang {page + 1} / {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => (canGoNext ? current + 1 : current))}
              disabled={!canGoNext}
              className="h-10 px-4 rounded-xl border border-outline-variant text-label-sm font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
