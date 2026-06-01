import { fetchRandomProductsByCategorySlug } from '@/features/products/services/products-api';
import { CollectionProductCarousel } from './collection-product-carousel';

const HOME_COLLECTIONS = [
  { title: 'Laptop học tập & làm việc nổi bật', slug: 'laptop', href: '/product/collection/laptop' },
  { title: 'Laptop gaming chiến mượt mọi trận', slug: 'gaming-laptop', href: '/product/collection/gaming-laptop' },
  { title: 'Màn hình sắc nét cho góc setup', slug: 'monitor', href: '/product/collection/monitor' },
  { title: 'Bàn phím gõ đã tay, làm việc mê hơn', slug: 'keyboard', href: '/product/collection/keyboard' },
  { title: 'Chuột chuẩn tay, thao tác nhanh hơn', slug: 'mouse', href: '/product/collection/mouse' },
  { title: 'Ghế ngồi êm, setup thêm chất', slug: 'chair', href: '/product/collection/chair' },
];

export async function CollectionProductShowcase() {
  const sections = await Promise.all(
    HOME_COLLECTIONS.map(async (collection) => ({
      ...collection,
      products: await fetchRandomProductsByCategorySlug(collection.slug, 8).catch(() => []),
    })),
  );

  return (
    <>
      {sections.map((section) => (
        <CollectionProductCarousel
          key={section.slug}
          title={section.title}
          href={section.href}
          products={section.products}
        />
      ))}
    </>
  );
}
