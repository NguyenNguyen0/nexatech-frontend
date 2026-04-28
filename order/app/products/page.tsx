import { Metadata } from 'next';
import { ProductShowcase } from '@/app/products/components/product-showcase';

export const metadata: Metadata = {
  title: 'Sản phẩm | NexaTech',
  description: 'Duyệt sản phẩm và đặt hàng trên NexaTech',
};

export default function ProductsPage() {
  return <ProductShowcase />;
}
