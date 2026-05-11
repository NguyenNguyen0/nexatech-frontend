type SearchHeaderProps = {
  keyword?: string;
};

export function SearchHeader({ keyword }: SearchHeaderProps) {
  return (
    <div className="mb-8 rounded-4xl border border-border bg-(image:--gradient-brand) px-6 py-8 text-white shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Search</p>
      <h1 className="mt-2 font-display text-4xl font-black">
        {keyword ? `Kết quả cho "${keyword}"` : 'Tìm kiếm sản phẩm'}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-white/85">
        Gợi ý nhanh và kết quả đầy đủ đều dùng API search mới. Bạn có thể refine thêm bằng bộ lọc bên dưới.
      </p>
    </div>
  );
}
