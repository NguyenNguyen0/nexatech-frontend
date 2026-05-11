import Link from 'next/link';
import { ArrowRight, Headphones, Laptop2, Smartphone, Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionContainer } from '@/features/storefront/shared/components/section-container';
import { SectionHeading } from '@/features/storefront/shared/components/section-heading';

const categories = [
  {
    title: 'Laptops',
    subtitle: 'Work. Create. Perform.',
    accent: 'from-primary via-primary-light to-secondary',
    icon: Laptop2,
    span: 'md:col-span-2 md:row-span-2',
    height: 'min-h-[28rem]',
  },
  {
    title: 'Smartphones',
    subtitle: 'Stay connected in style.',
    accent: 'from-secondary via-primary-light to-primary',
    icon: Smartphone,
    height: 'min-h-[13.5rem]',
  },
  {
    title: 'Accessories',
    subtitle: 'Complete your setup.',
    accent: 'from-primary-dark via-primary to-secondary',
    icon: Headphones,
    height: 'min-h-[13.5rem]',
  },
  {
    title: 'Smart Devices',
    subtitle: 'Upgrade your everyday.',
    accent: 'from-secondary-dark via-secondary to-primary-light',
    icon: Watch,
    span: 'md:col-span-2',
    height: 'min-h-[13.5rem]',
  },
];

export function CategoryGrid() {
  return (
    <SectionContainer className="pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          kicker="Browse categories"
          title="Find the perfect tech for your digital lifestyle."
        />
        <Link href="/product" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark">
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <article
              key={category.title}
              className={`group relative overflow-hidden rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${category.span ?? ''} ${category.height}`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${category.accent} opacity-95 transition duration-300 group-hover:scale-105`} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(10,10,15,0.32))]" />
              <div className="absolute -right-6 top-6 rounded-full border border-white/20 bg-white/10 p-5 text-white/70 backdrop-blur-sm">
                <Icon className="h-10 w-10" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-end text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">Curated collection</p>
                <h3 className="mt-3 text-3xl font-bold">{category.title}</h3>
                <p className="mt-2 max-w-xs text-base leading-7 text-white/80">{category.subtitle}</p>
                <Button className="mt-6 h-11 w-fit rounded-xl bg-white text-text-primary hover:bg-primary-subtle">
                  Explore
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </SectionContainer>
  );
}
