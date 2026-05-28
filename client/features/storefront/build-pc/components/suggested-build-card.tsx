/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SuggestedBuild } from '../types';

type SuggestedBuildCardProps = {
  build: SuggestedBuild;
  isAddingToCart?: boolean;
  onAddToCart: (build: SuggestedBuild) => void;
};

export function SuggestedBuildCard({
  build,
  isAddingToCart = false,
  onAddToCart,
}: SuggestedBuildCardProps) {
  const productHref = `/product/${build.slug}`;

  return (
    <article className="group relative flex h-full flex-col rounded-md border border-[#e8e8e8] bg-white p-2.5 transition-all hover:shadow-md">
      {build.savingsLabel ? (
        <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-[#e30019] px-1.5 py-[1px] text-[10px] font-bold text-white">
          {build.savingsLabel}
        </span>
      ) : null}

      <button
        type="button"
        aria-label={`Yêu thích ${build.name}`}
        className="absolute right-2 top-2 z-10 text-outline-variant transition hover:text-secondary"
      >
        <span className="material-symbols-outlined text-[20px]">favorite</span>
      </button>

      <Link href={productHref} className="relative mb-2 block aspect-square overflow-hidden rounded bg-[#f7f7f7] p-2.5">
        {build.image ? (
          <img
            src={build.image}
            alt={build.name}
            className="mx-auto h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-white">
            <span className="material-symbols-outlined text-[52px] text-outline">desktop_windows</span>
          </div>
        )}
      </Link>

      <Link
        href={productHref}
        className="mb-1.5 min-h-9 text-[12px] font-medium leading-[1.4] text-[#333] line-clamp-2 transition hover:text-primary"
      >
        {build.name}
      </Link>

      <div className="mt-auto">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-bold text-[#e30019]">{formatCurrency(build.price)}</span>
        </div>
        {build.originalPrice > build.price ? (
          <p className="text-[10px] text-[#999] line-through">{formatCurrency(build.originalPrice)}</p>
        ) : null}
      </div>

      <div className="mt-2 grid grid-cols-[1fr_34px] gap-2">
        <button
          type="button"
          onClick={() => onAddToCart(build)}
          disabled={isAddingToCart}
          className="rounded-sm border border-[#004d75] py-1 text-[11px] font-semibold text-[#004d75] transition hover:bg-[#004d75] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </button>
        <Link
          href={productHref}
          aria-label={`Xem chi tiết ${build.name}`}
          className="flex items-center justify-center rounded-sm border border-outline-variant text-on-surface transition hover:border-primary hover:text-primary"
        >
          <Eye size={15} />
        </Link>
      </div>
    </article>
  );
}
