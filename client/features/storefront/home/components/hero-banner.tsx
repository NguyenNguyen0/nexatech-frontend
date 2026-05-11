import Link from 'next/link';
import { ArrowRight, Headphones, Heart, Laptop2, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionContainer } from '@/features/storefront/shared/components/section-container';

const heroStats = [
  { value: '48h', label: 'giao nhanh tai thanh pho lon' },
  { value: '2 nam', label: 'NexaCare cho thiet bi cao cap' },
  { value: '150+', label: 'thuong hieu va doi tac toan cau' },
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

export function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-10 lg:pb-20 lg:pt-14">
      <div className="absolute inset-x-0 top-0 -z-20 h-[32rem] bg-[radial-gradient(circle_at_top_left,var(--color-primary-subtle),transparent_42%),radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--color-secondary)_18%,white),transparent_28%)]" />
      <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <SectionContainer>
        <div className="grid w-full gap-12 lg:grid-cols-12 lg:items-center">
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
                <div key={item.label} className="rounded-2xl border border-border bg-bg-elevated/80 p-4 backdrop-blur-sm">
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
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Live inventory</span>
                </div>
                <div className="relative mt-6 h-[25rem]">
                  {productVisuals.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className={`absolute rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-md ${item.className}`}>
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
      </SectionContainer>
    </section>
  );
}
