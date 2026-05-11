type SearchEmptyStateProps = {
  /** `'no-results'` — keyword present but no products found.
   *  `'no-keyword'` — page loaded without a keyword. */
  variant: 'no-results' | 'no-keyword';
};

export function SearchEmptyState({ variant }: SearchEmptyStateProps) {
  if (variant === 'no-keyword') {
    return (
      <div className="rounded-4xl border border-dashed border-border bg-bg-elevated px-6 py-14 text-center text-sm text-text-secondary">
        Sử dụng thanh tìm kiếm trên header để bắt đầu.
      </div>
    );
  }

  return (
    <div className="rounded-4xl border border-dashed border-border bg-bg-elevated px-6 py-14 text-center">
      <p className="text-lg font-semibold text-text-primary">Không có sản phẩm phù hợp</p>
      <p className="mt-2 text-sm text-text-secondary">Hãy thử từ khóa khác hoặc nới lỏng bộ lọc.</p>
    </div>
  );
}
