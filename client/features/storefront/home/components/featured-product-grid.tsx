'use client';

import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';

type ProductCardData = {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  badges: string[];
};

const featuredProducts: ProductCardData[] = [
  {
    id: 'f1',
    name: 'Laptop Gaming ASUS TUF F15 RTX 4060',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&h=300&fit=crop',
    price: 19_380_000,
    rating: 4.5,
    reviewCount: 131,
    badges: ['Hot', 'New'],
  },
  {
    id: 'f2',
    name: 'Laptop MSI Katana 15 i7-13620H',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=300&fit=crop',
    price: 22_490_000,
    rating: 5,
    reviewCount: 90,
    badges: ['Hot', 'New'],
  },
  {
    id: 'f3',
    name: 'VGA NVIDIA GeForce RTX 4070 12GB',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&h=300&fit=crop',
    price: 15_990_000,
    rating: 4,
    reviewCount: 10,
    badges: ['Hot', 'New'],
  },
  {
    id: 'f4',
    name: 'PC Gaming Intel i5-13400F GTX 1650',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop',
    price: 13_990_000,
    rating: 4.5,
    reviewCount: 47,
    badges: ['Hot'],
  },
  {
    id: 'f5',
    name: 'Màn hình Samsung Odyssey G5 27" 2K 165Hz',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop',
    price: 7_490_000,
    rating: 5,
    reviewCount: 5,
    badges: ['Hot', 'New'],
  },
  {
    id: 'f6',
    name: 'Bàn phím cơ Razer BlackWidow V4',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&h=300&fit=crop',
    price: 3_890_000,
    rating: 5,
    reviewCount: 23,
    badges: ['New'],
  },
  {
    id: 'f7',
    name: 'VGA AMD Radeon RX 7600 8GB',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300&h=300&fit=crop',
    price: 8_290_000,
    rating: 4.5,
    reviewCount: 5,
    badges: ['Hot', 'New'],
  },
  {
    id: 'f8',
    name: 'Chuột gaming Razer DeathAdder V3',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop',
    price: 1_690_000,
    rating: 4,
    reviewCount: 82,
    badges: ['Hot'],
  },
];

function formatVND(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1">
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
      {reviewCount > 0 && (
        <span className="text-[10px] text-[#999]">({reviewCount})</span>
      )}
    </div>
  );
}

function BadgePill({ label, variant }: { label: string; variant: 'hot' | 'new' }) {
  const colors =
    variant === 'hot'
      ? 'bg-[#e30019] text-white'
      : 'bg-[#0a8a50] text-white';

  return (
    <span className={`rounded-sm px-1.5 py-[1px] text-[9px] font-bold uppercase ${colors}`}>
      {label}
    </span>
  );
}

function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-md border border-[#e8e8e8] bg-white transition-all duration-150 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative bg-[#f7f7f7] p-2.5">
        <div className="absolute left-1.5 top-1.5 z-10 flex gap-0.5">
          {product.badges.map((badge) => (
            <BadgePill
              key={badge}
              label={badge}
              variant={badge.toLowerCase() === 'hot' ? 'hot' : 'new'}
            />
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="mx-auto aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-[12px] font-medium leading-[1.4] text-[#333] line-clamp-2">
          {product.name}
        </p>
        <div className="mt-1">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        </div>
        <p className="mt-1.5 text-[13px] font-bold text-[#e30019]">{formatVND(product.price)}</p>
      </div>
    </Link>
  );
}

export function FeaturedProductGrid() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-5">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-bold text-[#1b1c1c]">Sản phẩm nổi bật</h2>
        <Link
          href="/product?featured=true"
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[#004d75] transition hover:underline"
        >
          Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
