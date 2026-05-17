import Link from 'next/link';
import { Laptop, Monitor, Keyboard, Mouse, Headphones, Cpu } from 'lucide-react';

const categories = [
  { name: 'Laptop', icon: Laptop, slug: 'laptop' },
  { name: 'PC Gaming', icon: Cpu, slug: 'gaming-pc' },
  { name: 'Màn hình', icon: Monitor, slug: 'monitor' },
  { name: 'Bàn phím', icon: Keyboard, slug: 'keyboard' },
  { name: 'Chuột', icon: Mouse, slug: 'mouse' },
  { name: 'Tai nghe', icon: Headphones, slug: 'headphones' },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-5">
      <h2 className="mb-4 text-lg font-bold text-[#1b1c1c]">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/product/collection/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 rounded-md border border-[#e8e8e8] bg-white px-3 py-4 transition-all duration-150 hover:border-[#004d75]/25 hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef5fa]">
                <Icon className="h-5 w-5 text-[#004d75] transition-transform duration-150 group-hover:scale-110" />
              </div>
              <span className="text-center text-[12px] font-medium text-[#333]">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
