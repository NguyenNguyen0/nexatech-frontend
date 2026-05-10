import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ProductBrand, ProductCategory } from '../types';

const sortOptions = [
  { label: 'Phù hợp nhất', value: 'relevance,desc' },
  { label: 'Mới nhất', value: 'createdAt,desc' },
  { label: 'Giá tăng dần', value: 'price,asc' },
  { label: 'Giá giảm dần', value: 'price,desc' },
  { label: 'Đánh giá cao', value: 'averageRating,desc' },
];

interface CatalogFiltersFormProps {
  action: string;
  categories: ProductCategory[];
  brands: ProductBrand[];
  current: {
    keyword?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    maxRating?: string;
    sort?: string;
    featured?: string;
    size?: string;
  };
  showKeyword?: boolean;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-sm font-medium text-text-primary">{children}</label>;
}

export function CatalogFiltersForm({ action, categories, brands, current, showKeyword = false }: CatalogFiltersFormProps) {
  return (
    <aside className="rounded-3xl border border-border bg-bg-elevated p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Bộ lọc</p>
        <h2 className="mt-2 font-display text-xl font-bold text-text-primary">Tinh chỉnh kết quả</h2>
      </div>

      <form action={action} method="get" className="space-y-4">
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="size" value={current.size ?? '12'} />

        {showKeyword ? (
          <div className="space-y-2">
            <FieldLabel>Từ khóa</FieldLabel>
            <input
              name="keyword"
              defaultValue={current.keyword ?? ''}
              placeholder="Tìm sản phẩm..."
              className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
            />
          </div>
        ) : current.keyword ? (
          <input type="hidden" name="keyword" value={current.keyword} />
        ) : null}

        <div className="space-y-2">
          <FieldLabel>Danh mục</FieldLabel>
          <select
            name="categoryId"
            defaultValue={current.categoryId ?? ''}
            className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <FieldLabel>Thương hiệu</FieldLabel>
          <select
            name="brandId"
            defaultValue={current.brandId ?? ''}
            className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <FieldLabel>Giá từ</FieldLabel>
            <input
              name="minPrice"
              type="number"
              min="0"
              defaultValue={current.minPrice ?? ''}
              placeholder="0"
              className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Đến</FieldLabel>
            <input
              name="maxPrice"
              type="number"
              min="0"
              defaultValue={current.maxPrice ?? ''}
              placeholder="99999999"
              className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <FieldLabel>Đánh giá tối thiểu</FieldLabel>
            <select
              name="minRating"
              defaultValue={current.minRating ?? ''}
              className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
            >
              <option value="">Không giới hạn</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5</option>
            </select>
          </div>
          <div className="space-y-2">
            <FieldLabel>Đánh giá tối đa</FieldLabel>
            <select
              name="maxRating"
              defaultValue={current.maxRating ?? ''}
              className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
            >
              <option value="">Không giới hạn</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Sắp xếp</FieldLabel>
          <select
            name="sort"
            defaultValue={current.sort ?? 'createdAt,desc'}
            className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <FieldLabel>Chỉ hiển thị</FieldLabel>
          <select
            name="featured"
            defaultValue={current.featured ?? ''}
            className="h-11 w-full rounded-2xl border border-border bg-bg-base px-4 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Tất cả</option>
            <option value="true">Nổi bật</option>
            <option value="false">Không nổi bật</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Áp dụng
          </button>
          <Link
            href={action}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-bg-base px-4 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
          >
            Xóa lọc
          </Link>
        </div>
      </form>
    </aside>
  );
}
