import type { Metadata } from 'next';
import { HomeShowcase } from '@/features/home/components/home-showcase';

export const metadata: Metadata = {
  title: 'NexaTech | All Your Tech. One Place.',
  description: 'Discover premium devices, curated collections and flagship deals at NexaTech.',
};

export default function HomePage() {
  return <HomeShowcase />;
}
