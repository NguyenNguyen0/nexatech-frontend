/* eslint-disable @next/next/no-img-element */

import { formatCurrency } from '@/lib/utils';
import type { SuggestedBuild } from '../types';

type SuggestedBuildCardProps = {
  build: SuggestedBuild;
};

export function SuggestedBuildCard({ build }: SuggestedBuildCardProps) {
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

      <div className="relative mb-2 aspect-square overflow-hidden rounded bg-[#f7f7f7] p-2.5">
        <img
          src={build.image}
          alt={build.name}
          className="mx-auto h-full w-full object-contain transition duration-300 group-hover:scale-105"
        />
      </div>

      <h2 className="mb-1.5 min-h-9 text-[12px] font-medium leading-[1.4] text-[#333] line-clamp-2">
        {build.name}
      </h2>

      <div className="mt-auto">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-bold text-[#e30019]">{formatCurrency(build.price)}</span>
        </div>
        <p className="text-[10px] text-[#999] line-through">{formatCurrency(build.originalPrice)}</p>
      </div>

      <button
        type="button"
        className="mt-2 w-full rounded-sm border border-[#004d75] py-1 text-[11px] font-semibold text-[#004d75] transition hover:bg-[#004d75] hover:text-white"
      >
        Thêm vào giỏ
      </button>
    </article>
  );
}
