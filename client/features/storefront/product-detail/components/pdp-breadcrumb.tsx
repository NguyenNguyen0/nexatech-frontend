import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PdpBreadcrumbProps = {
  categoryName?: string;
  brandName?: string;
};

export function PdpBreadcrumb({ categoryName, brandName }: PdpBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant mb-6">
      <Link href="/" className="hover:text-primary transition-colors">
        Trang chủ
      </Link>
      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      <Link href="/product" className="hover:text-primary transition-colors">
        Sản phẩm
      </Link>
      {categoryName && (
        <>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className={brandName ? "hover:text-primary transition-colors" : "text-on-surface font-medium"}>
            {categoryName}
          </span>
        </>
      )}
      {brandName && (
        <>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">{brandName}</span>
        </>
      )}
    </nav>
  );
}
