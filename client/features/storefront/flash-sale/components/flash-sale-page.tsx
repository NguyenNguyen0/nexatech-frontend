'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Zap } from 'lucide-react';
import type { FlashSaleStripItem } from '@/features/flash-sale/services/flash-sale-strip-loader';

type Countdown = { hours: string; minutes: string; seconds: string };

function getCountdown(target: number): Countdown {
  const distance = Math.max(0, target - Date.now());
  return {
    hours: String(Math.floor(distance / 3_600_000)).padStart(2, '0'),
    minutes: String(Math.floor((distance % 3_600_000) / 60_000)).padStart(2, '0'),
    seconds: String(Math.floor((distance % 60_000) / 1_000)).padStart(2, '0'),
  };
}

function formatVND(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= Math.floor(rating)
              ? 'fill-[#f5a623] text-[#f5a623]'
              : star <= rating
                ? 'fill-[#f5a623]/50 text-[#f5a623]'
                : 'fill-[#ddd] text-[#ddd]'
          }`}
        />
      ))}
    </div>
  );
}

function ProductCard({ item }: { item: FlashSaleStripItem }) {
  return (
    <Link
      href={item.productSlug ? `/product/${item.productSlug}` : `/product/${item.productId}`}
      className="group flex flex-col rounded-lg border border-[#e5e5e5] bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-[#e30019] transition-all duration-200"
    >
      {/* Image */}
      <div className="relative bg-[#f7f7f7] p-4 aspect-square overflow-hidden">
        <span className="absolute left-2 top-2 z-10 rounded bg-[#e30019] px-1.5 py-0.5 text-[10px] font-bold text-white">
          -{item.discountPercent}%
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.productImage ?? `https://placehold.co/400x400/f7f7f7/999?text=NexaTech`}
          alt={item.productName}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <p className="text-[13px] font-medium text-[#222] line-clamp-2 leading-[1.4]">
          {item.productName}
        </p>
        <RatingStars rating={item.productRating ?? 4.5} />
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-base font-bold text-[#e30019]">{formatVND(item.salePrice)}</span>
          <span className="text-[11px] text-[#999] line-through">{formatVND(item.originalPrice)}</span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-1.5 w-full rounded-full bg-[#eee] overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#e30019] to-[#ff6b35]"
              style={{ width: `${Math.min(item.soldPercent, 100)}%` }}
            />
          </div>
          <p className="mt-0.5 text-[10px] text-[#888]">
            Còn lại {item.remainingStock}/{item.totalStock} sản phẩm
          </p>
        </div>

        <button
          type="button"
          className="mt-1 w-full rounded border border-[#e30019] py-1.5 text-[12px] font-semibold text-[#e30019] transition hover:bg-[#e30019] hover:text-white"
        >
          Mua ngay
        </button>
      </div>
    </Link>
  );
}

interface FlashSalePageProps {
  items: FlashSaleStripItem[];
  endsAt: number;
}

export function FlashSalePage({ items, endsAt }: FlashSalePageProps) {
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(endsAt));

  useEffect(() => {
    if (endsAt === 0) return;
    const timer = window.setInterval(() => setCountdown(getCountdown(endsAt)), 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Hero Banner + side GIF decorations */}
      <div className="relative mb-6 overflow-x-hidden">

        {/* Left GIF — fills space beside hero banner */}
        <div
          className="hidden xl:block absolute inset-y-0 left-0"
          style={{ right: 'calc(50% + 708px)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/flash_sale/flashsale.gif"
            alt="Flash Sale"
            className="w-full h-full object-cover object-center rounded-r-2xl"
          />
        </div>

        {/* Hero Banner */}
        <div className="mx-auto max-w-350 px-4">
          <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
            <Image
              src="/flash_sale/banner.png"
              alt="Flash Sale NexaTech"
              width={1800}
              height={400}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Right GIF — fills space beside hero banner */}
        <div
          className="hidden xl:block absolute inset-y-0 right-0"
          style={{ left: 'calc(50% + 608px)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/flash_sale/source.gif"
            alt="Flash Sale"
            className="w-full h-full object-cover object-center rounded-l-2xl"
          />
        </div>
      </div>

      {/* Main content: center = full container-max, side banners fill the gutter */}
      <div className="relative pb-10 overflow-x-hidden">

        {/* Left Side Banner — fixed-width, positioned beside center */}
        <div
          className="hidden xl:block absolute inset-y-0"
          style={{ right: 'calc(50% + 758px)', width: '500px' }}
        >
          <div className="sticky top-4 h-fit px-2">
            <Image
              src="/flash_sale/banner_1.png"
              alt="Flash Sale Banner"
              width={400}
              height={600}
              className="w-full h-150 rounded-2xl shadow-xl object-cover"
            />
          </div>
        </div>

        {/* Center — same max-w as hero banner */}
        <div className="mx-auto max-w-350 px-4">
          {/* Section title + countdown */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-linear-to-r from-[#e30019] to-[#ff4500] px-5 py-3 shadow-md">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300" />
              <span className="text-lg font-extrabold tracking-wide text-white">FLASH SALE</span>
              <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-white/80 font-medium">Kết thúc sau:</span>
              <div className="flex items-center gap-1">
                {[countdown.hours, countdown.minutes, countdown.seconds].map((unit, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className="text-sm font-bold text-white/70">:</span>
                    )}
                    <span className="rounded bg-black/30 px-2 py-0.5 font-mono text-[13px] font-bold text-white min-w-7 text-center">
                      {unit}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Product grid */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Zap className="h-12 w-12 text-[#ddd] mb-3" />
              <p className="text-[#888] text-sm">Hiện không có sản phẩm Flash Sale nào.</p>
              <p className="text-[#aaa] text-xs mt-1">Vui lòng quay lại sau!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side Banner — fixed-width, positioned beside center */}
        <div
          className="hidden xl:block absolute inset-y-0"
          style={{ left: 'calc(50% + 758px)', width: '500px' }}
        >
          <div className="sticky top-4 h-fit px-2">
            <Image
              src="/flash_sale/banner_2.png"
              alt="Flash Sale Banner"
              width={200}
              height={600}
              className="w-full h-150 rounded-2xl shadow-xl object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
