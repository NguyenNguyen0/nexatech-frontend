'use client';

import Link from 'next/link';
import { Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SectionContainer } from '@/features/storefront/shared/components/section-container';

type Countdown = {
  hours: string;
  minutes: string;
  seconds: string;
};

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

export function FlashSaleStrip() {
  const saleEndsAt = useMemo(() => Date.now() + 4 * 60 * 60 * 1000 + 32 * 60 * 1000 + 59 * 1000, []);
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(saleEndsAt));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdown(saleEndsAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [saleEndsAt]);

  return (
    <SectionContainer className="pb-20">
      <div className="overflow-hidden rounded-4xl bg-(image:--gradient-hero) px-6 py-8 text-text-inverse shadow-[0_24px_70px_rgba(0,82,255,0.22)] sm:px-8 lg:px-10 lg:py-10">
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
    </SectionContainer>
  );
}
