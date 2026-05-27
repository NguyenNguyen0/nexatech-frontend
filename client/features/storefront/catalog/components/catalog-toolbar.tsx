"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type CatalogToolbarProps = {
  totalItems: number;
  sort?: string;
};

const sortOptions = [
  { label: 'Phù hợp nhất', value: 'relevance,desc' },
  { label: 'Mới nhất', value: 'createdAt,desc' },
  { label: 'Giá: Thấp đến Cao', value: 'price,asc' },
  { label: 'Giá: Cao đến Thấp', value: 'price,desc' },
  { label: 'Đánh giá cao', value: 'averageRating,desc' },
];

export function CatalogToolbar({ totalItems, sort }: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = sortOptions.some((option) => option.value === sort) ? sort : 'relevance,desc';

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const nextSort = event.target.value;

    nextParams.set('sort', nextSort);
    nextParams.set('page', '1');

    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-surface p-4 rounded-md border border-outline-variant shadow-sm mb-6 gap-4">
      <div className="text-label-sm text-on-surface-variant font-medium">
        Hiển thị <span className="text-on-surface font-bold">{totalItems}</span> sản phẩm
      </div>
      <div className="flex items-center gap-2">
        <label className="text-label-sm text-on-surface-variant">Sắp xếp theo:</label>
        <select
          className="h-10 px-3 rounded-sm border border-outline-variant focus:border-primary outline-none text-body-md bg-surface-container-lowest text-on-surface cursor-pointer"
          value={currentSort}
          onChange={handleSortChange}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
