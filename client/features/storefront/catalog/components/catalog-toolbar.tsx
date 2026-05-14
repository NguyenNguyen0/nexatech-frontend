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
    <div className="flex flex-col sm:flex-row justify-between items-center bg-surface p-4 rounded-xl border border-outline-variant shadow-sm mb-6 gap-4">
      <div className="text-label-sm text-on-surface-variant font-medium">
        Hiển thị <span className="text-on-surface font-bold">{totalItems}</span> sản phẩm
      </div>
      <div className="flex items-center gap-2">
        <label className="text-label-sm text-on-surface-variant">Sắp xếp theo:</label>
        <select 
          className="h-10 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-body-md bg-surface-container-lowest text-on-surface cursor-pointer"
          defaultValue={sort}
        >
          <option value="relevance,desc">Bán chạy nhất</option>
          <option value="price,asc">Giá: Thấp đến Cao</option>
          <option value="price,desc">Giá: Cao đến Thấp</option>
          <option value="averageRating,desc">Đánh giá cao</option>
        </select>
      </div>
    </div>
  );
}
