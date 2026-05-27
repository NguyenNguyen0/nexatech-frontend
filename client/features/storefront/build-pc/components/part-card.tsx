/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import type { BuildPart, CatalogItem } from '../types';
import { Eye } from 'lucide-react';

type PartCardProps = {
  item: CatalogItem;
  part: BuildPart;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
};

export function PartCard({ item, part, isSelected = false, onSelect }: PartCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(item.id);
    }
  };

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded border bg-white text-left transition hover:shadow-md',
        isSelected ? 'border-primary ring-1 ring-primary/50' : 'border-[#e8e8e8]',
      )}
    >
      {/* Image */}
      <Link
        href={`/product/${item.slug}`}
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <div className="relative flex aspect-square items-center justify-center bg-white p-2.5">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded bg-[#f5f5f5]">
              <span className="material-symbols-outlined text-[52px] text-outline">
                {part.icon}
              </span>
            </div>
          )}

          {item.badge ? (
            <span className="absolute left-2 top-2 rounded bg-secondary-container px-2 py-0.5 text-[11px] font-semibold text-on-secondary-container">
              {item.badge}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2.5">
        <Link
          href={`/product/${item.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mb-1 min-h-10 line-clamp-2 text-[15px] font-semibold leading-5 text-on-surface transition hover:text-primary"
        >
          {item.name}
        </Link>
        <p className="mb-3 text-label-sm text-outline">
          {item.brand} {item.series ? `· ${item.series}` : ''}
        </p>
        <div className="mt-auto">
          <div className="mb-3 flex flex-col">
            <span className="text-[18px] font-bold leading-6 text-secondary">
              {formatCurrency(item.price)}
            </span>
            {item.originalPrice ? (
              <span className="text-label-sm text-outline line-through">
                {formatCurrency(item.originalPrice)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="font-medium">{item.averageRating.toFixed(1)}</span>
          </div>
          <div className="mt-3 flex gap-2">
			<button
              type="button"
              onClick={handleClick}
              className="flex-1 rounded-sm bg-primary px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-primary-container"
            >
              Chọn
            </button>
            <Link
              href={`/product/${item.slug}`}
              target="_blank"
              rel="noreferrer"
              className="justify-center items-center flex rounded-sm border border-outline-variant px-3 py-2 text-center text-[12px] font-semibold text-on-surface transition hover:border-primary hover:text-primary"
            >
              <Eye className="mr-1" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
