'use client';

import { Star, ChevronRight } from 'lucide-react';

export function ProductSection() {
  const categories = [
    {
      title: '🍎 iPhone Chính Hãng',
      subtitle: 'Apple Authorized Reseller',
      icon: '📱',
      products: [
        { name: '📱 iPhone 17 Pro 256GB', price: '26.100.000', oldPrice: '27.900.000', discount: 13 },
        { name: '📱 iPhone 17 128GB', price: '21.900.000', oldPrice: '23.500.000', discount: 7 },
        { name: '📱 iPhone 16 Pro 256GB', price: '24.500.000', oldPrice: '28.000.000', discount: 12 },
        { name: '📱 iPhone 16 128GB', price: '18.990.000', oldPrice: '20.490.000', discount: 8 },
        { name: '📱 iPhone 15 Plus 256GB', price: '20.490.000', oldPrice: '23.990.000', discount: 15 },
      ],
    },
    {
      title: '🔷 Samsung Chính Hãng',
      subtitle: 'Điện thoại cao cấp',
      icon: '📱',
      products: [
        { name: '📱 Galaxy S26 Ultra 256GB', price: '29.990.000', oldPrice: '33.990.000', discount: 12 },
        { name: '📱 Galaxy Z Fold7 512GB', price: '41.990.000', oldPrice: '46.990.000', discount: 11 },
        { name: '📱 Galaxy S25 Plus 256GB', price: '23.490.000', oldPrice: '26.490.000', discount: 11 },
        { name: '📱 Galaxy A76 5G', price: '10.990.000', oldPrice: '12.490.000', discount: 12 },
        { name: '📱 Galaxy Z Flip7 256GB', price: '24.990.000', oldPrice: '27.990.000', discount: 10 },
      ],
    },
  ];

  const ProductCard = ({ name, price, oldPrice, discount }: any) => (
    <div className="group flex flex-col h-full bg-bg-elevated dark:bg-gray-800 rounded-lg overflow-hidden border border-border dark:border-border/50 hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-smooth">
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
          📦
        </div>
        <span className="absolute top-3 right-3 bg-danger text-white text-xs font-bold px-2 py-1 rounded-lg">
          -{discount}%
        </span>
        <span className="absolute top-3 left-3 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">
          MỚI
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <h4 className="text-sm font-medium text-text-primary dark:text-text-inverse line-clamp-2 mb-3 leading-snug group-hover:text-primary transition-smooth">
          {name}
        </h4>

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-black text-primary mb-1">
            {price}₫
          </div>
          <div className="text-xs text-text-tertiary line-through">
            {oldPrice}₫
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-3 h-3 fill-warning text-warning" />
            ))}
          </div>
          <span className="text-xs text-text-tertiary">(48)</span>
        </div>

        {/* Badge */}
        <div className="mt-auto pt-3 border-t border-border dark:border-border/50">
          <p className="text-xs text-success font-semibold">✓ Trả góp 0% lãi suất</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
      {categories.map((category, idx) => (
        <div key={idx} className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-black text-text-primary dark:text-text-inverse flex items-center gap-2">
                {category.title}
              </h2>
              <p className="text-sm text-text-secondary dark:text-text-tertiary">{category.subtitle}</p>
            </div>
            <a
              href="#"
              className="flex items-center gap-1 text-primary hover:text-primary-light transition-smooth font-bold text-sm"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {category.products.map((product) => (
              <ProductCard
                key={product.name}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                discount={product.discount}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Browse More Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        {['💻 Laptop & Máy Tính', '⌚ Phụ kiện & Đồ công nghệ'].map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 p-6 hover:shadow-lg transition-smooth cursor-pointer border border-primary/20 dark:border-primary/10"
          >
            <div className="text-4xl mb-3">{item.charAt(0)}</div>
            <h3 className="text-xl font-display font-bold text-text-primary dark:text-text-inverse mb-2">
              {item}
            </h3>
            <p className="text-sm text-text-secondary dark:text-text-tertiary">
              Khám phá {item.split(' ')[1].toLowerCase()} giá tốt
            </p>
            <div className="absolute bottom-0 right-0 opacity-10 text-6xl">{item.charAt(0)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
