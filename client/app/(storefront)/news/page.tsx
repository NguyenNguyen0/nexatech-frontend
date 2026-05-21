import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import { NewsCard } from '@/features/news/components';
import { fetchPublicNews } from '@/features/news/services/news-api';

export const metadata: Metadata = {
  title: 'Tin tức | NexaTech',
  description: 'Cập nhật tin tức công nghệ và thông báo mới nhất từ NexaTech.',
};

export default async function NewsPage() {
  const newsList = await fetchPublicNews().catch(() => []);

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e7f3f8] px-3 py-1 text-xs font-semibold text-[#004d75]">
          <Newspaper className="h-4 w-4" />
          NexaTech News
        </div>
        <h1 className="text-3xl font-bold text-[#1b1c1c] md:text-4xl">
          Tin tức
        </h1>
      </div>

      {newsList.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {newsList.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#d7dfe5] bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-[#1b1c1c]">
            Chưa có tin tức nào
          </h2>
          <p className="mt-2 text-sm text-[#666]">
            Tin tức mới sẽ được hiển thị tại đây khi được xuất bản.
          </p>
        </div>
      )}
    </section>
  );
}
