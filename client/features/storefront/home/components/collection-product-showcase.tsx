import { fetchRandomProductsByCategorySlug } from '@/features/products/services/products-api';
import { CollectionProductCarousel } from './collection-product-carousel';

const HOME_COLLECTIONS = [
  { title: 'Laptop', slug: 'laptop', href: '/product/collection/laptop' },
  { title: 'Laptop Gaming', slug: 'gaming-laptop', href: '/product/collection/gaming-laptop' },
  { title: 'Màn hình', slug: 'monitor', href: '/product/collection/monitor' },
  { title: 'Bàn phím', slug: 'keyboard', href: '/product/collection/keyboard' },
  { title: 'Chuột', slug: 'mouse', href: '/product/collection/mouse' },
  { title: 'Ghế', slug: 'chair', href: '/product/collection/chair' },
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
