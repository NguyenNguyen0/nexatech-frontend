import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PdpBreadcrumbProps = {
  categoryName?: string;
  brandName?: string;
};

export function PdpBreadcrumb({ categoryName, brandName }: PdpBreadcrumbProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
      <Link href="/product" className="inline-flex items-center gap-2 transition hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>
      {categoryName && (
        <>
          <span aria-hidden="true">•</span>
          <span>{categoryName}</span>
        </>
      )}
      {brandName && (
        <>
          <span aria-hidden="true">•</span>
          <span>{brandName}</span>
        </>
      )}
    </div>
  );
}
