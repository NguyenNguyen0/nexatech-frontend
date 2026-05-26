import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type SearchParams = Record<string, string | string[] | undefined>;

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  searchParams: SearchParams;
  basePath?: string;
};

function buildQuery(current: SearchParams, updates: Record<string, string | undefined>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized !== undefined && normalized !== '') {
      params.set(key, normalized);
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === '') params.delete(key);
    else params.set(key, value);
  }

  return params.toString();
}

function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function CatalogPagination({ currentPage, totalPages, hasPrevious, hasNext, searchParams, basePath = '/product' }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pageRange = getPageRange(currentPage, totalPages);

  return (
    <div className="mt-8 flex justify-center">
      <nav className="flex items-center gap-1" aria-label="Phân trang">
        {hasPrevious ? (
          <Link
            href={`${basePath}?${buildQuery(searchParams, { page: String(currentPage - 1) })}`}
            className="w-10 h-10 flex items-center justify-center rounded-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Trang trước"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </Link>
        ) : (
          <span className="w-10 h-10 flex items-center justify-center rounded-sm border border-outline-variant text-on-surface-variant opacity-50 cursor-not-allowed">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </span>
        )}

        {pageRange.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
              ...
            </span>
          ) : p === currentPage ? (
            <span key={p} className="w-10 h-10 flex items-center justify-center rounded-sm bg-primary text-on-primary font-medium" aria-current="page">
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={`${basePath}?${buildQuery(searchParams, { page: String(p) })}`}
              className="w-10 h-10 flex items-center justify-center rounded-sm text-on-surface-variant hover:bg-surface-container transition-colors font-medium"
            >
              {p}
            </Link>
          ),
        )}

        {hasNext ? (
          <Link
            href={`${basePath}?${buildQuery(searchParams, { page: String(currentPage + 1) })}`}
            className="w-10 h-10 flex items-center justify-center rounded-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Trang sau"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
        ) : (
          <span className="w-10 h-10 flex items-center justify-center rounded-sm border border-outline-variant text-on-surface-variant opacity-50 cursor-not-allowed">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </span>
        )}
      </nav>
    </div>
  );
}
