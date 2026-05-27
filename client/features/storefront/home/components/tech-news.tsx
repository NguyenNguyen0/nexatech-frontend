import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { fetchPublicNews } from '@/features/news/services/news-api';

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

export async function TechNews() {
  const newsList = await fetchPublicNews().catch(() => []);
  const latestNews = newsList.slice(0, 3);

  if (latestNews.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-5">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-bold text-[#1b1c1c]">News công nghệ</h2>
        <Link
          href="/news"
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[#004d75] transition hover:underline"
        >
          Xem thêm <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {latestNews.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group overflow-hidden rounded-md border border-[#e8e8e8] bg-white transition-all duration-150 hover:shadow-md"
          >
            <div className="relative overflow-hidden bg-[#eef3f6]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.thumbnailUrl || fallbackImage}
                alt={article.title}
                className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
              <span className="absolute left-2 top-2 rounded-sm bg-[#004d75] px-1.5 py-[1px] text-[9px] font-bold text-white">
                News
              </span>
            </div>
            <div className="p-3">
              <p className="text-[13px] font-medium leading-[1.45] text-[#333] line-clamp-2 group-hover:text-[#004d75] transition-colors">
                {article.title}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-[#999]">
                <Clock className="h-3 w-3" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
