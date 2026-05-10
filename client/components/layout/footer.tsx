'use client';

import { Globe, Mail, MapPin, Phone as PhoneIcon, SendHorizonal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const quickLinks = ['Privacy Policy', 'Terms of Service', 'Support Center', 'Global Shipping', 'Affiliate Program'];
  const helpLinks = ['Setup Guides', 'Driver Downloads', 'Service Centers', 'Order Status'];

  return (
    <footer className="mt-20 border-t border-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-elevated)_92%,white),var(--color-primary-subtle))] transition-smooth">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="rounded-2xl bg-[image:var(--gradient-brand)] px-3 py-2 text-sm font-black tracking-[0.24em] text-white shadow-lg shadow-primary/20">
                NT
              </div>
              <div>
                <p className="font-display text-xl font-bold text-text-primary">NexaTech</p>
                <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Precision for the digital frontier</p>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-text-secondary">
              Premium hardware for work, play and creative focus. Built around trusted support,
              fast fulfilment and a cleaner buying experience.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { label: 'Web', icon: Globe },
                { label: 'Mail', icon: Mail },
                { label: 'Share', icon: SendHorizonal },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href="#"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-bg-elevated text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                    aria-label={item.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Quick Links</h3>
            <ul className="mt-5 space-y-3 text-sm text-text-secondary">
              {quickLinks.map((link) => (
                <li key={link}>
                  <Link href="/product" className="transition hover:text-primary">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Product Help</h3>
            <ul className="mt-5 space-y-3 text-sm text-text-secondary">
              {helpLinks.map((link) => (
                <li key={link}>
                  <Link href="/product" className="transition hover:text-primary">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Join the Pulse</h3>
            <p className="mt-5 text-sm leading-7 text-text-secondary">
              Get launch drops, weekly tech edits and early access to flagship deals.
            </p>
            <div className="mt-5 flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                className="h-11 rounded-xl border-border bg-bg-elevated"
              />
              <Button className="h-11 rounded-xl px-4">
                Join
              </Button>
            </div>
            <div className="mt-6 space-y-3">
              <a href="tel:1800.6018" className="flex items-start gap-3 rounded-2xl border border-border/70 bg-bg-elevated/70 p-4 transition hover:border-primary/25 hover:bg-bg-elevated">
                <PhoneIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Call sales</p>
                  <p className="font-semibold text-text-primary">1800.6018</p>
                </div>
              </a>
              <a href="mailto:support@nexatech.vn" className="flex items-start gap-3 rounded-2xl border border-border/70 bg-bg-elevated/70 p-4 transition hover:border-primary/25 hover:bg-bg-elevated">
                <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Email</p>
                  <p className="font-semibold text-text-primary">support@nexatech.vn</p>
                </div>
              </a>
              <a href="#" className="flex items-start gap-3 rounded-2xl border border-border/70 bg-bg-elevated/70 p-4 transition hover:border-primary/25 hover:bg-bg-elevated">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Studio</p>
                  <p className="font-semibold text-text-primary">77 Tran Quang Khai, Ho Chi Minh City</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/70 pt-6 text-center text-sm text-text-tertiary">
          <p>© {currentYear} NexaTech. Precision engineering for the digital frontier.</p>
          <p className="mt-1">Business registration 0123456789 · 77 Tran Quang Khai, Ho Chi Minh City</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em]">Built for the client storefront experience</p>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 max-lg:hidden lg:flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition hover:scale-105 hover:bg-primary-dark"
        type="button"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </footer>
  );
}
