'use client';

import { ChevronDown, Heart, Menu, Moon, ShoppingCart, Sparkles, Sun, UserRound, X } from 'lucide-react';
import { Armchair, Boxes, Gamepad2, HardDrive, Headphones, Keyboard, Laptop, Mic, Monitor, Mouse } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductSearch } from '@/components/layout/product-search';

type CategorySection = {
  heading: string;
  items: string[];
};

type CategoryGroup = {
  name: string;
  icon: LucideIcon;
  sections: CategorySection[];
};

const categoryGroups: CategoryGroup[] = [
  {
    name: 'Laptop',
    icon: Laptop,
    sections: [
      { heading: 'Brands', items: ['ASUS', 'ACER', 'MSI', 'LENOVO', 'DELL', 'HP Pavilion', 'LG Gram'] },
    ],
  },
  {
    name: 'Gaming Laptop',
    icon: Gamepad2,
    sections: [
      { heading: 'Brands', items: ['ACER / Predator', 'ASUS / ROG', 'MSI', 'LENOVO', 'DELL', 'GIGABYTE', 'HP'] },
    ],
  },
  {
    name: 'Case - Power Supply - Cooling',
    icon: Boxes,
    sections: [
      { heading: 'PC Case', items: ['ASUS', 'Corsair', 'Lian Li', 'NZXT', 'Jonsbo'] },
      { heading: 'Power Supply (PSU)', items: ['ASUS', 'DeepCool', 'Corsair', 'NZXT', 'MSI'] },
    ],
  },
  {
    name: 'RAM - SSD - HDD',
    icon: HardDrive,
    sections: [
      { heading: 'RAM', items: ['Corsair', 'Kingston', 'G.Skill', 'PNY'] },
      { heading: 'SSD', items: ['Samsung', 'Western Digital', 'Kingston', 'Corsair', 'PNY'] },
      { heading: 'HDD', items: ['Western Digital', 'Seagate', 'Toshiba'] },
    ],
  },
  {
    name: 'Speakers - Microphone - Webcam',
    icon: Mic,
    sections: [
      { heading: 'Speakers', items: ['Edifier', 'Razer', 'Logitech', 'SoundMax'] },
      { heading: 'Microphone', items: ['HyperX'] },
    ],
  },
  {
    name: 'Monitor',
    icon: Monitor,
    sections: [
      {
        heading: 'Brands',
        items: ['LG', 'ASUS', 'ViewSonic', 'Dell', 'Gigabyte', 'AOC', 'Acer', 'HKC', 'MSI', 'Samsung', 'Philips', 'E-Dra', 'VSP'],
      },
    ],
  },
  {
    name: 'Keyboard',
    icon: Keyboard,
    sections: [
      {
        heading: 'Brands',
        items: [
          'AKKO',
          'AULA',
          'Dare-U',
          'Durgod',
          'Leobog',
          'Keychron',
          'FL-Esports',
          'Corsair',
          'E-Dra',
          'Cidoo',
          'Machenike',
          'ASUS',
          'Logitech',
          'Razer',
          'Leopold',
          'SteelSeries',
          'Rapoo',
          'VGN',
          'MadLions',
          'Skyloong',
        ],
      },
    ],
  },
  {
    name: 'Mouse',
    icon: Mouse,
    sections: [
      {
        heading: 'Brands',
        items: ['Logitech', 'Razer', 'Corsair', 'Microsoft', 'Dare-U', 'ASUS', 'SteelSeries', 'Glorious', 'Rapoo', 'HyperX', 'ATK'],
      },
    ],
  },
  {
    name: 'Headphones',
    icon: Headphones,
    sections: [
      {
        heading: 'Brands',
        items: ['ASUS', 'HyperX', 'Corsair', 'Razer', 'ONIKUMA', 'SteelSeries', 'Rapoo', 'Logitech', 'Edifier'],
      },
    ],
  },
  {
    name: 'Chair',
    icon: Armchair,
    sections: [
      { heading: 'Gaming Chair', items: ['Corsair', 'Warrior', 'E-DRA', 'DXRacer', 'Cougar', 'AKRacing', 'Razer'] },
      { heading: 'Ergonomic Chair', items: ['Warrior', 'Sihoo', 'E-Dra'] },
    ],
  },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categoryGroups[0].name);
  const currentCategory = categoryGroups.find((category) => category.name === activeCategory) ?? categoryGroups[0];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg-elevated/85 backdrop-blur-xl transition-smooth">
      <div className="border-b border-border/70 bg-[image:var(--gradient-brand)] px-4 py-2 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 text-xs font-medium sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Premium devices, curated launches and next-day delivery across key cities.
          </span>
          <div className="hidden items-center gap-6 lg:flex">
            <Link href="/product" className="text-white/85 transition hover:text-white">
              Launch calendar
            </Link>
            <Link href="/product" className="text-white/85 transition hover:text-white">
              Business orders
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-[image:var(--gradient-brand)] px-3 py-2 text-sm font-black tracking-[0.24em] text-white shadow-lg shadow-primary/20">
              NT
            </div>
            <div>
              <span className="block font-display text-xl font-bold text-text-primary">NexaTech</span>
              <span className="hidden text-xs uppercase tracking-[0.18em] text-text-tertiary sm:block">All Your Tech. One Place.</span>
            </div>
          </Link>

          <div
            className="relative -mb-4 hidden pb-4 lg:block"
            onMouseEnter={() => setCategoryMenuOpen(true)}
            onMouseLeave={() => setCategoryMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setCategoryMenuOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-base px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
              aria-expanded={categoryMenuOpen}
              aria-haspopup="true"
            >
              <Menu className="h-4 w-4" />
              Danh muc
              <ChevronDown className={`h-4 w-4 transition ${categoryMenuOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {categoryMenuOpen ? (
              <div className="absolute left-0 top-full z-50 w-[70rem] max-w-[calc(100vw-4rem)] pt-2">
                <div className="overflow-hidden rounded-[1.75rem] border border-border bg-bg-elevated shadow-[0_28px_80px_rgba(14,18,48,0.16)]">
                <div className="grid grid-cols-[16rem_1fr]">
                  <div className="border-r border-border bg-bg-base/80 p-3">
                    {categoryGroups.map((group) => (
                      <button
                        key={group.name}
                        type="button"
                        onMouseEnter={() => setActiveCategory(group.name)}
                        onFocus={() => setActiveCategory(group.name)}
                        className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${group.name === currentCategory.name
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-text-primary hover:bg-primary/8 hover:text-primary'}`}
                      >
                        <group.icon className="h-4 w-4 shrink-0" />
                        <span>{group.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-6 border-b border-border pb-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Main category</p>
                        <h3 className="mt-2 flex items-center gap-2 text-2xl font-bold text-text-primary">
                          <currentCategory.icon className="h-6 w-6" />
                          {currentCategory.name}
                        </h3>
                      </div>
                      <Button asChild className="h-10 rounded-xl px-4">
                        <Link href="/product">View all</Link>
                      </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-6 xl:grid-cols-4">
                      {currentCategory.sections.map((section) => (
                        <div key={section.heading}>
                          <p className="text-sm font-semibold text-primary">{section.heading}</p>
                          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                            {section.items.map((item) => (
                              <li key={item}>
                                <button type="button" className="text-left transition hover:text-primary">
                                  {item}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            ) : null}
          </div> 
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ProductSearch className="hidden md:block md:w-80 lg:w-md" placeholder="Search premium devices" />

          <button type="button" className="hidden rounded-full p-2 text-text-secondary transition hover:bg-primary/10 hover:text-primary sm:inline-flex">
            <Heart className="h-5 w-5" />
          </button>

          <button type="button" className="relative rounded-full p-2 text-text-secondary transition hover:bg-primary/10 hover:text-primary">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">2</span>
          </button>

          <button type="button" className="hidden rounded-full p-2 text-text-secondary transition hover:bg-primary/10 hover:text-primary sm:inline-flex">
            <UserRound className="h-5 w-5" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full p-2 text-text-secondary transition hover:bg-primary/10 hover:text-primary"
            type="button"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 text-text-secondary transition hover:bg-primary/10 hover:text-primary lg:hidden"
            type="button"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-border/70 px-4 py-3 md:hidden sm:px-6">
        <div className="mx-auto max-w-7xl">
          <ProductSearch placeholder="Search premium devices" />
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/70 bg-bg-elevated lg:hidden">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-4 sm:px-6">
            <div className="rounded-[1.5rem] border border-border bg-bg-base p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Categories</p>
                  <p className="mt-1 text-xs text-text-tertiary">Select a main category and browse its sub-categories.</p>
                </div>
                <Menu className="h-5 w-5 text-primary" />
              </div>

              <div className="mt-4 space-y-4">
                {categoryGroups.map((group) => (
                  <div key={group.name} className="rounded-2xl border border-border/80 bg-bg-elevated p-4">
                    <Link href="/product" className="flex items-center justify-between text-sm font-semibold text-text-primary">
                      <span className="inline-flex items-center gap-2">
                        <group.icon className="h-4 w-4" />
                        {group.name}
                      </span>
                      <span className="text-text-tertiary">View</span>
                    </Link>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {group.sections.slice(0, 2).map((section) => (
                        <div key={section.heading}>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{section.heading}</p>
                          <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
                            {section.items.slice(0, 3).map((item) => (
                              <li key={item}>
                                <button type="button" className="text-left transition hover:text-primary">
                                  {item}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button asChild className="mt-1 h-11 rounded-xl">
              <Link href="/product">Explore collections</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
