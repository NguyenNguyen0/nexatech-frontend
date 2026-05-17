import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';

const newsArticles = [
  {
    id: '1',
    title: 'RTX 5060 Ti ra mắt: hiệu năng ngang RTX 4070, giá chỉ từ 10 triệu',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=250&fit=crop',
    time: '3 giờ trước',
    tag: 'GPU',
  },
  {
    id: '2',
    title: 'Top 10 laptop gaming tầm trung đáng mua nhất 2025',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=250&fit=crop',
    time: '5 giờ trước',
    tag: 'Laptop',
  },
  {
    id: '3',
    title: 'So sánh AMD Ryzen 7 9800X3D vs Intel Core i7-14700K cho gaming',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=250&fit=crop',
    time: '1 ngày trước',
    tag: 'CPU',
  },
];

export function TechNews() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-5">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-bold text-[#1b1c1c]">Tin tức công nghệ</h2>
        <Link
          href="#"
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[#004d75] transition hover:underline"
        >
          Xem thêm <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {newsArticles.map((article) => (
          <Link
            key={article.id}
            href="#"
            className="group overflow-hidden rounded-md border border-[#e8e8e8] bg-white transition-all duration-150 hover:shadow-md"
          >
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.image}
                alt={article.title}
                className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
              <span className="absolute left-2 top-2 rounded-sm bg-[#004d75] px-1.5 py-[1px] text-[9px] font-bold text-white">
                {article.tag}
              </span>
            </div>
            <div className="p-3">
              <p className="text-[13px] font-medium leading-[1.45] text-[#333] line-clamp-2">
                {article.title}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-[#999]">
                <Clock className="h-3 w-3" />
                <span>{article.time}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
