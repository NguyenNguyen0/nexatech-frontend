'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Zap, Search, ArrowUpDown, X } from 'lucide-react';
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

function PageStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 1859px) {
            .side-banner-left, .side-banner-right {
              display: none !important;
            }
          }
        `,
      }}
    />
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-2.5 w-2.5 ${
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
  const isSoldOut = item.remainingStock === 0;

  return (
    <Link
      href={item.productSlug ? `/product/${item.productSlug}` : `/product/${item.productId}`}
      className="group flex flex-col rounded-md border border-[#e0e0e0] bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden shadow-xs hover:shadow-md hover:border-[#e30019] transition-all duration-200"
    >
      {/* Image */}
      <div className="relative bg-[#f7f7f7] dark:bg-gray-900/50 p-3 aspect-square overflow-hidden flex items-center justify-center">
        <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-[#e30019] px-1.5 py-[1px] text-[10px] font-bold text-white uppercase">
          -{item.discountPercent}%
        </span>
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.productImage ?? `https://placehold.co/400x400/f7f7f7/999?text=NexaTech`}
          alt={item.productName}
          className={`mx-auto aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105 ${isSoldOut ? 'opacity-40 grayscale' : ''}`}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <p className="text-[12px] font-medium leading-[1.4] text-[#333] dark:text-gray-100 line-clamp-2 min-h-[34px]">
          {item.productName}
        </p>
        <div className="mt-0.5">
          <RatingStars rating={item.productRating ?? 4.5} />
        </div>
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-[13px] font-bold text-[#e30019]">{formatVND(item.salePrice)}</span>
          <span className="text-[10px] text-[#999] line-through">{formatVND(item.originalPrice)}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-1 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-[#eee] dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#e30019]"
              style={{ width: `${Math.min(item.soldPercent, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#999] dark:text-gray-400">
            Còn lại {item.remainingStock}/{item.totalStock} sản phẩm
          </p>
        </div>

        <button
          type="button"
          className="mt-1.5 w-full rounded-sm border border-[#e30019] py-1 text-[11px] font-semibold text-[#e30019] transition hover:bg-[#e30019] hover:text-white cursor-pointer"
        >
          {isSoldOut ? 'Hết hàng' : 'Mua ngay'}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (endsAt === 0) return;
    const timer = window.setInterval(() => setCountdown(getCountdown(endsAt)), 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  // Handle sticky filter bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute categories based on keywords in item names
  const categories = useMemo(() => {
    const catMap = {
      all: 'Tất cả Deal',
      pc_laptop: 'PC & Laptop',
      screen: 'Màn hình',
      gear: 'Bàn phím & Chuột',
      other: 'Sản phẩm khác',
    };

    return Object.entries(catMap).map(([id, label]) => {
      let count = 0;
      if (id === 'all') {
        count = items.length;
      } else {
        count = items.filter(item => {
          const name = item.productName.toLowerCase();
          if (id === 'pc_laptop') return name.includes('pc') || name.includes('laptop') || name.includes('intel') || name.includes('ryzen');
          if (id === 'screen') return name.includes('màn hình') || name.includes('monitor') || name.includes('viewsonic') || name.includes('lg');
          if (id === 'gear') return name.includes('bàn phím') || name.includes('chuột') || name.includes('mouse') || name.includes('keyboard') || name.includes('tai nghe') || name.includes('headset');
          return !name.includes('pc') && !name.includes('laptop') && !name.includes('intel') && !name.includes('ryzen') &&
                 !name.includes('màn hình') && !name.includes('monitor') && !name.includes('viewsonic') && !name.includes('lg') &&
                 !name.includes('bàn phím') && !name.includes('chuột') && !name.includes('mouse') && !name.includes('keyboard') && !name.includes('tai nghe') && !name.includes('headset');
        }).length;
      }
      return { id, label, count };
    }).filter(cat => cat.count > 0 || cat.id === 'all');
  }, [items]);

  // Filter and sort items
  const processedItems = useMemo(() => {
    let result = [...items];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.productName.toLowerCase().includes(query));
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(item => {
        const name = item.productName.toLowerCase();
        if (selectedCategory === 'pc_laptop') return name.includes('pc') || name.includes('laptop') || name.includes('intel') || name.includes('ryzen');
        if (selectedCategory === 'screen') return name.includes('màn hình') || name.includes('monitor') || name.includes('viewsonic') || name.includes('lg');
        if (selectedCategory === 'gear') return name.includes('bàn phím') || name.includes('chuột') || name.includes('mouse') || name.includes('keyboard') || name.includes('tai nghe') || name.includes('headset');
        return !name.includes('pc') && !name.includes('laptop') && !name.includes('intel') && !name.includes('ryzen') &&
               !name.includes('màn hình') && !name.includes('monitor') && !name.includes('viewsonic') && !name.includes('lg') &&
               !name.includes('bàn phím') && !name.includes('chuột') && !name.includes('mouse') && !name.includes('keyboard') && !name.includes('tai nghe') && !name.includes('headset');
      });
    }

    // Sort items
    if (sortBy === 'discount') {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.salePrice - a.salePrice);
    } else if (sortBy === 'sold') {
      result.sort((a, b) => b.soldPercent - a.soldPercent);
    }

    return result;
  }, [items, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#fbf9f8] dark:bg-gray-900 transition-colors duration-300 pb-20 relative overflow-x-clip font-body">
      <PageStyles />

      {/* Main Container */}
      <div className="mx-auto max-w-[1200px] px-4 pt-4 relative">
        
        {/* Side Banner Left */}
        <div
          className="side-banner-left block absolute top-[10px] bottom-0 right-[100%] mr-8 w-[300px]"
        >
          <div className="sticky top-[146px] h-fit">
            <Image
              src="/flash_sale/banner_1.png"
              alt="Flash Sale Banner Left"
              width={300}
              height={750}
              className="w-full rounded-md shadow-xs object-contain"
            />
          </div>
        </div>

        {/* Side Banner Right */}
        <div
          className="side-banner-right block absolute top-[10px] bottom-0 left-[100%] ml-8 w-[300px]"
        >
          <div className="sticky top-[146px] h-fit">
            <Image
              src="/flash_sale/banner_2.png"
              alt="Flash Sale Banner Right"
              width={300}
              height={750}
              className="w-full rounded-md shadow-xs object-contain"
            />
          </div>
        </div>
        
        {/* Top Header Banner */}
        <div className="relative mb-4 w-full overflow-hidden rounded-md shadow-xs bg-white dark:bg-gray-800">
          <Image
            src="/flash_sale/banner.gif"
            alt="Flash Sale NexaTech"
            width={1200}
            height={300}
            className="w-full object-cover"
            priority
          />
        </div>

        {/* Section title + countdown (Red Header bar) */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-gradient-to-r from-[#e30019] to-[#ff4500] px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-1.5">
            <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300 animate-pulse" />
            <span className="text-base font-bold tracking-wide text-white uppercase">FLASH SALE</span>
            <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-white/90 font-medium">Kết thúc sau:</span>
            <div className="flex items-center gap-1">
              {[countdown.hours, countdown.minutes, countdown.seconds].map((unit, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-xs font-bold text-white/80">:</span>}
                  <span className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[12px] font-bold text-white min-w-[24px] text-center">
                    {unit}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Filter / Category Navigation & Search */}
        <div className={`transition-all duration-200 ${
          isSticky
            ? 'fixed top-[136px] left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md border-b border-gray-200 dark:border-gray-800 py-3 px-4'
            : 'rounded-md bg-white dark:bg-gray-800 border border-[#e8e8e8] dark:border-gray-700 p-4 mb-5'
        }`}>
          <div className={`${isSticky ? 'mx-auto max-w-[1200px]' : ''} flex flex-col md:flex-row md:items-center justify-between gap-3`}>
            
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 shrink-0 rounded-sm px-3.5 py-1.5 text-[12px] font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#e30019] text-white'
                      : 'bg-[#f7f7f7] text-[#555] dark:bg-gray-700 dark:text-gray-200 hover:bg-[#eee] dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1 rounded-sm ${
                    selectedCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-[#777] dark:bg-gray-600 dark:text-gray-300'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {/* Search query input */}
              <div className="relative flex-1 md:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm flash sale..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-sm border border-[#ddd] dark:border-gray-700 bg-[#f7f7f7] dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#e30019]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-2.5 pr-7 py-1.5 text-[12px] font-semibold rounded-sm border border-[#ddd] dark:border-gray-700 bg-[#f7f7f7] dark:bg-gray-900 text-[#555] dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="default">Mặc định</option>
                  <option value="discount">% Giảm nhiều nhất</option>
                  <option value="sold">Bán chạy nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Product Grid */}
        {processedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-md bg-white dark:bg-gray-800 border border-[#e8e8e8] dark:border-gray-700 shadow-xs">
            <Zap className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-[13px] font-semibold text-gray-500">Không tìm thấy deal phù hợp</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Vui lòng thử từ khóa khác hoặc danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {processedItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
