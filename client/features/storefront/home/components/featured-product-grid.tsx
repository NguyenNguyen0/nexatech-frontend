import { Heart, Headphones, Laptop2, Smartphone, Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/features/storefront/shared/components/section-heading';

const featuredDeals = [
  {
    title: 'Nexa Pro Tablet 12',
    category: 'Tablets',
    price: '$849.00',
    originalPrice: '$999.00',
    badge: '-15%',
    icon: Laptop2,
  },
  {
    title: 'Nexa S24 Ultra',
    category: 'Smartphones',
    price: '$1,199.00',
    originalPrice: null,
    badge: 'Flagship',
    icon: Smartphone,
  },
  {
    title: 'Titan X Pro 16',
    category: 'Gaming',
    price: '$2,499.00',
    originalPrice: null,
    badge: 'Creator',
    icon: Headphones,
  },
  {
    title: 'Nexa Watch Series G',
    category: 'Wearables',
    price: '$399.00',
    originalPrice: null,
    badge: 'New',
    icon: Watch,
  },
];

export function FeaturedProductGrid() {
  return (
    <section className="bg-bg-elevated/70 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading
            kicker="Featured deals"
            title="Precision picks for work, play and travel."
          />
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="rounded-full border border-border bg-bg-base px-3 py-2">Free shipping</span>
            <span className="rounded-full border border-border bg-bg-base px-3 py-2">Flexible financing</span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredDeals.map((deal) => {
            const Icon = deal.icon;

            return (
              <article key={deal.title} className="group rounded-[1.75rem] border border-border bg-bg-base p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {deal.badge}
                  </span>
                  <button
                    type="button"
                    className="rounded-full border border-border bg-bg-elevated p-2 text-text-secondary transition hover:border-primary hover:text-primary"
                    aria-label={`Save ${deal.title}`}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 rounded-3xl bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-primary-subtle)_88%,white),white)] p-6">
                  <div className="flex aspect-square items-center justify-center rounded-[1.25rem] border border-white/80 bg-white shadow-inner">
                    <div className="rounded-[1.4rem] bg-[linear-gradient(160deg,var(--color-primary),var(--color-secondary))] p-6 text-white shadow-lg transition duration-300 group-hover:scale-105">
                      <Icon className="h-14 w-14" />
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">{deal.category}</p>
                <h3 className="mt-2 text-xl font-semibold text-text-primary">{deal.title}</h3>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-mono text-2xl font-bold text-primary">{deal.price}</span>
                  {deal.originalPrice ? <span className="pb-0.5 text-sm text-text-tertiary line-through">{deal.originalPrice}</span> : null}
                </div>
                <Button className="mt-6 h-11 w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-text-inverse">
                  Add to cart
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
