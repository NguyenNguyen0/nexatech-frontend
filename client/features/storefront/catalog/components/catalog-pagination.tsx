import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type SearchParams = Record<string, string | string[] | undefined>;

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  searchParams: SearchParams;
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

export function CatalogPagination({ currentPage, totalPages, hasPrevious, hasNext, searchParams }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pageRange = getPageRange(currentPage, totalPages);

  return (
    <div className="flex justify-center">
      <nav className="flex items-center gap-1.5" aria-label="Phân trang">
        {hasPrevious ? (
          <Link
            href={`/product?${buildQuery(searchParams, { page: String(currentPage - 1) })}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-secondary transition hover:border-primary hover:text-primary"
            aria-label="Trang trước"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Link>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-tertiary opacity-40">
            <ChevronRight className="h-4 w-4 rotate-180" />
          </span>
        )}

        {pageRange.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="flex h-10 w-10 items-center justify-center text-sm text-text-tertiary">
              ...
            </span>
          ) : p === currentPage ? (
            <span key={p} className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white" aria-current="page">
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={`/product?${buildQuery(searchParams, { page: String(p) })}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-sm text-text-secondary transition hover:border-primary hover:text-primary"
            >
              {p}
            </Link>
          ),
        )}

        {hasNext ? (
          <Link
            href={`/product?${buildQuery(searchParams, { page: String(currentPage + 1) })}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-secondary transition hover:border-primary hover:text-primary"
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-tertiary opacity-40">
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
