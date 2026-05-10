type SearchResultSummaryProps = {
  keyword?: string;
  totalItems: number;
  currentPage: number;
  totalPages: number;
};

export function SearchResultSummary({ keyword, totalItems, currentPage, totalPages }: SearchResultSummaryProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-bg-elevated px-5 py-4">
      <p className="text-sm font-semibold text-text-primary">
        {keyword ? `${totalItems.toLocaleString('vi-VN')} kết quả` : 'Nhập từ khóa để tìm kiếm'}
      </p>
      {keyword && totalPages > 1 && (
        <p className="text-xs text-text-tertiary">
          Trang {currentPage} / {totalPages}
        </p>
      )}
    </div>
  );
}
