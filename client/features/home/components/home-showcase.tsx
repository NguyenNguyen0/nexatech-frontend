'use client';

import { ArrowRight, Clock3, Headphones, Heart, Laptop2, ShieldCheck, Smartphone, Sparkles, Truck, Watch } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Countdown = {
  hours: string;
  minutes: string;
  seconds: string;
};

const heroStats = [
  { value: '48h', label: 'giao nhanh tại thành phố lớn' },
  { value: '2 năm', label: 'NexaCare cho thiết bị cao cấp' },
  { value: '150+', label: 'thương hiệu và đối tác toàn cầu' },
];

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
    icon: Laptop2,
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

const productVisuals = [
  {
    title: 'Featherweight performance',
    subtitle: 'Ultra-thin chassis, desktop-class speed.',
    icon: Laptop2,
    className: 'top-2 right-0 w-64 rotate-6 md:w-72',
  },
  {
    title: 'Pro camera system',
    subtitle: 'Flagship optics with AI imaging.',
    icon: Smartphone,
    className: 'bottom-4 left-0 w-48 -rotate-6 md:w-56',
  },
  {
    title: 'Immersive audio',
    subtitle: 'Spatial sound for work and play.',
    icon: Headphones,
    className: 'top-1/2 left-1/3 w-44 -translate-y-1/2 md:w-48',
  },
];

function getCountdown(target: number): Countdown {
  const distance = Math.max(0, target - Date.now());
  const hours = Math.floor(distance / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export function HomeShowcase() {
  const saleEndsAt = useMemo(() => Date.now() + 4 * 60 * 60 * 1000 + 32 * 60 * 1000 + 59 * 1000, []);
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(saleEndsAt));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdown(saleEndsAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [saleEndsAt]);

  return (
    <div className="overflow-x-hidden bg-bg-base">
      <section className="relative isolate overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
        <div className="absolute inset-x-0 top-0 -z-20 h-[32rem] bg-[radial-gradient(circle_at_top_left,var(--color-primary-subtle),transparent_42%),radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--color-secondary)_18%,white),transparent_28%)]" />
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-4 w-4" />
              Premium devices. Trusted experience.
            </div>
            <h1 className="max-w-3xl text-5xl leading-[0.95] font-black text-text-primary sm:text-6xl lg:text-[5.25rem]">
              All your tech.
              <span className="mt-2 block bg-[image:var(--gradient-text)] bg-clip-text text-transparent">
                One place.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
              Precision engineering meets a curated retail experience. Discover laptops, smartphones,
              audio gear and smart devices selected for creative work and high-performance living.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="h-12 rounded-xl px-6 text-sm font-semibold shadow-lg shadow-primary/20">
                <Link href="/product">
                  Shop Now at NexaTech
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-border bg-bg-elevated px-6 text-sm font-semibold">
                <Link href="/product">Explore Collections</Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-bg-elevated/80 p-4 backdrop-blur-sm"
                >
                  <p className="font-display text-2xl font-bold text-text-primary">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative mx-auto min-h-[32rem] max-w-[36rem] rounded-[2rem] border border-white/60 bg-bg-elevated/70 p-6 shadow-[0_30px_80px_rgba(0,82,255,0.14)] backdrop-blur-xl">
              <div className="absolute inset-x-10 top-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="absolute -right-10 top-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
              <div className="absolute -bottom-10 left-0 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
              <div className="relative z-10 h-full rounded-[1.6rem] border border-white/60 bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-white)_82%,transparent),color-mix(in_srgb,var(--color-primary-subtle)_80%,white))] p-5">
                <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-white/70 px-4 py-3 text-sm text-text-secondary">
                  <span>Recommended by NexaLab</span>
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    Live inventory
                  </span>
                </div>
                <div className="relative mt-6 h-[25rem]">
                  {productVisuals.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className={`absolute rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-md ${item.className}`}
                      >
                        <div className="rounded-[1.25rem] bg-[linear-gradient(160deg,var(--color-primary),var(--color-secondary))] p-6 text-white shadow-inner">
                          <Icon className="h-9 w-9" />
                        </div>
                        <p className="mt-4 text-base font-semibold text-text-primary">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">{item.subtitle}</p>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-0 right-2 rounded-[1.5rem] border border-primary/15 bg-white/85 p-5 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Accessories curated for every setup</p>
                        <p className="text-xs text-text-secondary">Audio, charging, carry and desk essentials.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-[image:var(--gradient-hero)] px-6 py-8 text-text-inverse shadow-[0_24px_70px_rgba(0,82,255,0.22)] sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_auto_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Tech flash sale</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Up to 40% off on flagship gear and studio audio.</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                A short-window offer on premium devices selected for speed, portability and immersive media.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Hours', value: countdown.hours },
                { label: 'Mins', value: countdown.minutes },
                { label: 'Secs', value: countdown.seconds },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
                    {item.label === 'Hours' && <Clock3 className="h-5 w-5 text-white/70" />}
                    <span>{item.value}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/65">{item.label}</p>
                </div>
              ))}
            </div>

            <div>
              <Button asChild className="h-12 rounded-xl bg-white px-6 font-semibold text-primary hover:bg-primary-subtle">
                <Link href="/product">Shop Deals Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Browse categories</p>
              <h2 className="mt-2 text-3xl font-bold text-text-primary sm:text-4xl">Find the perfect tech for your digital lifestyle.</h2>
            </div>
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
                  className={`group relative overflow-hidden rounded-[2rem] border border-border bg-bg-elevated p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${category.span ?? ''} ${category.height}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-95 transition duration-300 group-hover:scale-105`} />
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
        </div>
      </section>

      <section className="bg-bg-elevated/70 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Featured deals</p>
              <h2 className="mt-2 text-3xl font-bold text-text-primary sm:text-4xl">Precision picks for work, play and travel.</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="rounded-full border border-border bg-bg-base px-3 py-2">Free shipping</span>
              <span className="rounded-full border border-border bg-bg-base px-3 py-2">Flexible financing</span>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredDeals.map((deal) => {
              const Icon = deal.icon;

              return (
                <article
                  key={deal.title}
                  className="group rounded-[1.75rem] border border-border bg-bg-base p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
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
                  <div className="mt-4 rounded-[1.5rem] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-primary-subtle)_88%,white),white)] p-6">
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
                    {deal.originalPrice ? (
                      <span className="pb-0.5 text-sm text-text-tertiary line-through">{deal.originalPrice}</span>
                    ) : null}
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

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1280px] gap-6 md:grid-cols-3">
          {trustPoints.map((point) => {
            const Icon = point.icon;

            return (
              <article
                key={point.title}
                className="rounded-[1.75rem] border border-border bg-bg-elevated p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg"
              >
                <div className="inline-flex rounded-2xl bg-primary/10 p-4 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-text-primary">{point.title}</h3>
                <p className="mt-3 text-base leading-7 text-text-secondary">{point.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
