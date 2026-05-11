type CatalogToolbarProps = {
  totalItems: number;
  sort?: string;
};

function getSortLabel(sort?: string) {
  if (sort === 'price,asc') return 'Giá tăng dần';
  if (sort === 'price,desc') return 'Giá giảm dần';
  if (sort === 'averageRating,desc') return 'Đánh giá cao';
  if (sort === 'relevance,desc') return 'Phù hợp nhất';
  return 'Mới nhất';
}

export function CatalogToolbar({ totalItems, sort }: CatalogToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-bg-elevated px-5 py-4">
      <p className="text-sm text-text-secondary">
        Hiển thị <span className="font-bold text-text-primary">{totalItems.toLocaleString('vi-VN')}</span> sản phẩm
      </p>
      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
        <span>Sắp xếp:</span>
        <span className="font-semibold text-primary">{getSortLabel(sort)}</span>
      </div>
    </div>
  );
}
