import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsDetailView } from '@/features/news/components';
import { fetchPublicNewsBySlug } from '@/features/news/services/news-api';

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await fetchPublicNewsBySlug(slug).catch(() => null);

  if (!news) {
    return {
      title: 'Tin tức | NexaTech',
    };
  }

  return {
    title: `${news.title} | NexaTech`,
    description: news.description,
    openGraph: {
      title: news.title,
      description: news.description,
      images: news.thumbnailUrl ? [news.thumbnailUrl] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await fetchPublicNewsBySlug(slug).catch(() => null);

  if (!news) {
    notFound();
  }

  return <NewsDetailView news={news} />;
}
