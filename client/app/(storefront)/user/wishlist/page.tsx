'use client';

import type { Metadata } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const WISHLIST_KEY = 'nexatech_wishlist';

type WishlistItem = {
  productId: string;
  name: string;
  price: number;
  thumbnail?: string;
  slug: string;
  addedAt: string;
};

function readWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function removeFromWishlist(productId: string): WishlistItem[] {
  const list = readWishlist().filter((i) => i.productId !== productId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('wishlist-updated'));
  return list;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(readWishlist());
    const handler = () => setItems(readWishlist());
    window.addEventListener('wishlist-updated', handler);
    return () => window.removeEventListener('wishlist-updated', handler);
  }, []);

  const handleRemove = (productId: string, name: string) => {
    setItems(removeFromWishlist(productId));
    toast.success(`Đã xóa "${name}" khỏi danh sách yêu thích`);
  };

  if (!mounted) return null;

  return (
    <div className="flex-grow bg-surface-container-low py-8">
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
            <p className="mt-1 text-body-md text-on-surface-variant">{items.length} sản phẩm</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                localStorage.removeItem(WISHLIST_KEY);
                window.dispatchEvent(new Event('wishlist-updated'));
                setItems([]);
                toast.success('Đã xóa toàn bộ danh sách yêu thích');
              }}
              className="text-label-sm text-error hover:underline"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {items.length === 0 ? (
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
                key={item.productId}
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
                <div className="p-3 flex flex-col flex-grow">
                  <Link href={`/product/${item.slug}`} className="text-label-sm font-medium text-on-surface line-clamp-2 mb-2 hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-body-sm font-bold text-primary">{formatCurrency(item.price)}</span>
                    <button
                      onClick={() => handleRemove(item.productId, item.name)}
                      className="text-error hover:bg-error/10 rounded-full p-1 transition-colors"
                      title="Xóa khỏi yêu thích"
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
