import { Headphones, ShieldCheck, Truck } from 'lucide-react';
import { SectionContainer } from '@/features/storefront/shared/components/section-container';

const trustPoints = [
  {
    title: 'Extended Warranty',
    description: 'Every premium device ships with a 2-year NexaCare protection plan.',
    icon: ShieldCheck,
  },
  {
    title: 'Global Shipping',
    description: 'Secure delivery to more than 150 countries with real-time tracking.',
    icon: Truck,
  },
  {
    title: '24/7 Tech Support',
    description: 'Product specialists are available around the clock for setup and troubleshooting.',
    icon: Headphones,
  },
];

export function TrustStrip() {
  return (
    <SectionContainer className="py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {trustPoints.map((point) => {
          const Icon = point.icon;

          return (
            <article key={point.title} className="rounded-[1.75rem] border border-border bg-bg-elevated p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
              <div className="inline-flex rounded-2xl bg-primary/10 p-4 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-text-primary">{point.title}</h3>
              <p className="mt-3 text-base leading-7 text-text-secondary">{point.description}</p>
            </article>
          );
        })}
      </div>
    </SectionContainer>
  );
}
