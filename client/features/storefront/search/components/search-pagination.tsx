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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-bg-elevated px-5 py-4">
      <p className="text-sm text-text-secondary">
        Hiển thị {displayCount} / {totalItems.toLocaleString('vi-VN')} sản phẩm
      </p>

      <div className="flex items-center gap-2">
        {hasPrevious && (
          <Link
            href={`/search?${buildQuery(searchParams, { page: String(currentPage - 1) })}`}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-bg-base px-4 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
          >
            Trang trước
          </Link>
        )}
        {hasNext && (
          <Link
            href={`/search?${buildQuery(searchParams, { page: String(currentPage + 1) })}`}
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Trang sau
          </Link>
        )}
      </div>
    </div>
  );
}
