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
      <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        {hasContext ? (
          <>
            <Link href="/product" className="hover:text-primary transition-colors">
              Sản phẩm
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-medium">{pageTitle}</span>
          </>
        ) : (
          <span className="text-on-surface font-medium">Sản phẩm</span>
        )}
      </nav>

      <div className="mb-8">
        <h1 className="text-headline-md font-headline-md text-on-surface mb-2">{pageTitle}</h1>
        <p className="text-body-lg text-on-surface-variant">{pageDescription}</p>
      </div>
    </>
  );
}
