import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type CatalogPageHeaderProps = {
  pageTitle: string;
  pageDescription: string;
  hasContext: boolean;
};

export function CatalogPageHeader({ pageTitle, pageDescription, hasContext }: CatalogPageHeaderProps) {
  return (
    <>
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-text-secondary">
        <Link href="/" className="transition-colors hover:text-primary">
          Trang chủ
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
        {hasContext ? (
          <>
            <Link href="/product" className="transition-colors hover:text-primary">
              Sản phẩm
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="font-semibold text-primary">{pageTitle}</span>
          </>
        ) : (
          <span className="font-semibold text-primary">Sản phẩm</span>
        )}
      </nav>

      <div className="mb-8 rounded-4xl border border-border bg-[image:var(--gradient-brand)] px-6 py-8 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Catalog</p>
        <h1 className="mt-2 font-display text-4xl font-black">{pageTitle}</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/85">{pageDescription}</p>
      </div>
    </>
  );
}
