import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react';
import Link from 'next/link';
import type { NewsDetail } from '../types';
import styles from './news-content.module.css';

type NewsDetailViewProps = {
  news: NewsDetail;
};

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='520'%3E%3Crect width='1200' height='520' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%239ca3af'%3ENexaTech News%3C/text%3E%3C/svg%3E";

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function NewsDetailView({ news }: NewsDetailViewProps) {
  return (
    <article className="bg-[#fbf9f8]">
      <div className="relative h-[340px] overflow-hidden bg-[#e8eef2] md:h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={news.thumbnailUrl || fallbackImage}
          alt={news.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      </div>

      <div className="mx-auto max-w-[1120px] px-4 pb-12 sm:px-6 lg:px-8">
        <div className="relative z-10 -mt-24 rounded-xl bg-white p-6 shadow-xl md:p-10">
          <Link
            href="/news"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#004d75] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách tin tức
          </Link>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-[#1b1c1c] md:text-5xl">
            {news.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-5 border-b border-[#ececec] pb-6 text-sm text-[#777]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatDate(news.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {news.createdBy}
            </span>
          </div>

          <p className="mt-6 text-lg leading-8 text-[#333]">{news.description}</p>

          <div
            className={`${styles.newsContent} mt-8`}
            dangerouslySetInnerHTML={{ __html: news.contentHtml }}
          />
        </div>
      </div>
    </article>
  );
}
