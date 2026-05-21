import { CalendarDays, UserRound } from 'lucide-react';
import Link from 'next/link';
import type { NewsListItem } from '../types';

type NewsCardProps = {
  item: NewsListItem;
};

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='640' height='360' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='22' fill='%239ca3af'%3ENexaTech News%3C/text%3E%3C/svg%3E";

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function NewsCard({ item }: NewsCardProps) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group overflow-hidden rounded-lg border border-[#e8e8e8] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#eef3f6]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnailUrl || fallbackImage}
          alt={item.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-[#004d75] px-2 py-1 text-[11px] font-semibold text-white">
          Tin tức
        </span>
      </div>

      <div className="space-y-3 p-4">
        <h2 className="line-clamp-2 text-base font-bold leading-snug text-[#1b1c1c] transition group-hover:text-[#004d75]">
          {item.title}
        </h2>
        <p className="line-clamp-3 text-sm leading-6 text-[#555]">
          {item.description}
        </p>
        <div className="flex flex-wrap items-center gap-4 border-t border-[#f0f0f0] pt-3 text-xs text-[#777]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(item.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            {item.createdBy}
          </span>
        </div>
      </div>
    </Link>
  );
}
