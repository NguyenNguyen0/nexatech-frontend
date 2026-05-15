import type { Metadata } from 'next';
import { BuildPcPage } from '@/features/storefront/build-pc/components/build-pc-page';

export const metadata: Metadata = {
  title: 'Build PC',
  description:
    'Tự tay chọn linh kiện và xây dựng cấu hình PC phù hợp với nhu cầu của bạn tại NexaTech.',
};

export default function BuildPcRoute() {
  return <BuildPcPage />;
}
