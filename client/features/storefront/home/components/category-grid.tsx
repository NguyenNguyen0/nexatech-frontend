import Link from 'next/link';

const categories = [
  { name: 'Laptop', image: '/category/laptop.webp', slug: 'laptop' },
  { name: 'Gaming', image: '/category/gaming.webp', slug: 'gaming-laptop' },
  { name: 'Màn hình', image: '/category/screen.webp', slug: 'monitor' },
  { name: 'Bàn phím', image: '/category/keyboard.webp', slug: 'keyboard' },
  { name: 'Chuột', image: '/category/mouse.webp', slug: 'mouse' },
  { name: 'Tai nghe', image: '/category/earphone.webp', slug: 'headphones' },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-5">
      <h2 className="mb-4 text-lg font-bold text-[#1b1c1c]">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/product/collection/${cat.slug}`}
            className="group flex flex-col items-center gap-2.5 rounded-md border border-[#e8e8e8] bg-white px-3 py-4 transition-all duration-150 hover:border-[#004d75]/25 hover:shadow-sm"
          >
            <div className="flex h-14 w-14 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.name}
                className="h-12 w-12 object-contain transition-transform duration-150 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-[12px] font-medium text-[#333]">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
