import Link from 'next/link';

type SearchParams = Record<string, string | string[] | undefined>;

type SearchPaginationProps = {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  displayCount: number;
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

export function SearchPagination({
  currentPage,
  totalItems,
  hasPrevious,
  hasNext,
  displayCount,
  searchParams,
}: SearchPaginationProps) {
  if (!hasPrevious && !hasNext) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-outline-variant shadow-sm mt-8">
      <p className="text-label-sm text-on-surface-variant font-medium">
        Hiển thị <span className="text-on-surface font-bold">{displayCount}</span> / <span className="text-on-surface font-bold">{totalItems}</span> sản phẩm
      </p>

      <div className="flex items-center gap-2">
        {hasPrevious ? (
          <Link
            href={`/search?${buildQuery(searchParams, { page: String(currentPage - 1) })}`}
            className="h-10 px-4 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors text-label-sm font-medium"
          >
            Trang trước
          </Link>
        ) : (
          <span className="h-10 px-4 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant opacity-50 cursor-not-allowed text-label-sm font-medium">
            Trang trước
          </span>
        )}
        
        {hasNext ? (
          <Link
            href={`/search?${buildQuery(searchParams, { page: String(currentPage + 1) })}`}
            className="h-10 px-4 flex items-center justify-center rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors text-label-sm font-medium"
          >
            Trang sau
          </Link>
        ) : (
          <span className="h-10 px-4 flex items-center justify-center rounded-lg bg-primary text-on-primary opacity-50 cursor-not-allowed text-label-sm font-medium">
            Trang sau
          </span>
        )}
      </div>
    </div>
  );
}
