'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, MessageCircle, ChevronDown } from 'lucide-react';
import { fetchSubcategories } from '../services/products-api';
import type { ProductBrand, ProductCategory, ProductSubcategory } from '../types';

const sortOptions = [
  { label: 'Phù hợp nhất', value: 'relevance,desc' },
  { label: 'Mới nhất', value: 'createdAt,desc' },
  { label: 'Giá tăng dần', value: 'price,asc' },
  { label: 'Giá giảm dần', value: 'price,desc' },
  { label: 'Đánh giá cao', value: 'averageRating,desc' },
];

const ratingOptions = [
  { label: 'Tất cả', value: '' },
  { label: '4★ trở lên', value: '4' },
  { label: '3★ trở lên', value: '3' },
  { label: '2★ trở lên', value: '2' },
];

interface CatalogFiltersFormProps {
  action: string;
  categories: ProductCategory[];
  brands: ProductBrand[];
  current: {
    keyword?: string;
    categoryId?: string;
    subcategoryId?: string;
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

export function CatalogFiltersForm({
  action,
  categories,
  brands,
  current,
  showKeyword = false,
}: CatalogFiltersFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(current.categoryId ?? '');
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== '') {
      setLoadingSubcategories(true);
      fetchSubcategories(selectedCategoryId)
        .then(setSubcategories)
        .catch(() => setSubcategories([]))
        .finally(() => setLoadingSubcategories(false));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24 space-y-4">
        {/* ── Filter panel ──────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5 shadow-sm">
          <h3 className="mb-5 flex items-center justify-between font-display text-base font-bold text-text-primary">
            Bộ lọc
            <SlidersHorizontal className="h-4 w-4 text-text-tertiary" />
          </h3>

          <form action={action} method="get" className="space-y-5">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="size" value={current.size ?? '12'} />
            <input type="hidden" name="subcategoryId" value={current.subcategoryId ?? ''} />

            {/* Keyword */}
            {showKeyword ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-text-primary">Từ khóa</p>
                <input
                  name="keyword"
                  defaultValue={current.keyword ?? ''}
                  placeholder="Tìm sản phẩm..."
                  className="h-9 w-full rounded-lg border border-border bg-bg-base px-3 text-sm outline-none transition focus:border-primary"
                />
              </div>
            ) : current.keyword ? (
              <input type="hidden" name="keyword" value={current.keyword} />
            ) : null}

            {/* Category & Subcategory */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-text-primary">Danh mục</p>
                <div
                  className={
                    categories.length > 6 ? 'max-h-80 space-y-2 overflow-y-auto pr-1' : 'space-y-2'
                  }
                >
                  {/* "All categories" option */}
                  <label className="group flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      name="categoryId"
                      value=""
                      checked={selectedCategoryId === ''}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-text-secondary transition-colors group-hover:text-primary">
                      Tất cả
                    </span>
                  </label>

                  {/* Categories with subcategories */}
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <label className="group flex cursor-pointer items-center gap-2.5">
                        <input
                          type="radio"
                          name="categoryId"
                          value={cat.id}
                          checked={selectedCategoryId === cat.id}
                          onChange={(e) => setSelectedCategoryId(e.target.value)}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="text-sm text-text-secondary transition-colors group-hover:text-primary">
                          {cat.name}
                        </span>
                      </label>

                      {/* Subcategories (show when parent is selected) */}
                      {selectedCategoryId === cat.id && subcategories.length > 0 && (
                        <div className="ml-6 mt-2 space-y-2 border-l border-border/50 pl-3">
                          {loadingSubcategories ? (
                            <div className="py-1 text-xs text-text-tertiary">Đang tải...</div>
                          ) : (
                            <>
                              <label className="group flex cursor-pointer items-center gap-2.5">
                                <input
                                  type="radio"
                                  name="subcategoryId"
                                  value=""
                                  defaultChecked={!current.subcategoryId}
                                  className="h-4 w-4 accent-primary"
                                />
                                <span className="text-sm text-text-secondary transition-colors group-hover:text-primary">
                                  Tất cả
                                </span>
                              </label>
                              {subcategories.map((subcat) => (
                                <label
                                  key={subcat.id}
                                  className="group flex cursor-pointer items-center gap-2.5"
                                >
                                  <input
                                    type="radio"
                                    name="subcategoryId"
                                    value={subcat.id}
                                    defaultChecked={current.subcategoryId === subcat.id}
                                    className="h-4 w-4 accent-primary"
                                  />
                                  <span className="text-sm text-text-secondary transition-colors group-hover:text-primary">
                                    {subcat.name}
                                  </span>
                                </label>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand */}
            {brands.length > 0 && (
              <div>
                <p className="mb-2.5 text-xs font-bold text-text-primary">Thương hiệu</p>
                <div
                  className={
                    brands.length > 6 ? 'max-h-44 space-y-2 overflow-y-auto pr-1' : 'space-y-2'
                  }
                >
                  <label className="group flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      name="brandId"
                      value=""
                      defaultChecked={!current.brandId}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-text-secondary transition-colors group-hover:text-primary">
                      Tất cả
                    </span>
                  </label>
                  {brands.map((brand) => (
                    <label key={brand.id} className="group flex cursor-pointer items-center gap-2.5">
                      <input
                        type="radio"
                        name="brandId"
                        value={brand.id}
                        defaultChecked={current.brandId === brand.id}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm text-text-secondary transition-colors group-hover:text-primary">
                        {brand.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            <div>
              <p className="mb-2.5 text-xs font-bold text-text-primary">Khoảng giá</p>
              <div className="flex items-center gap-2">
                <input
                  name="minPrice"
                  type="number"
                  min="0"
                  step="10000"
                  defaultValue={current.minPrice ?? ''}
                  placeholder="Từ"
                  className="h-9 w-full min-w-0 rounded-lg border border-border bg-bg-base px-3 text-sm outline-none transition focus:border-primary"
                />
                <span className="shrink-0 text-text-tertiary">—</span>
                <input
                  name="maxPrice"
                  type="number"
                  min="0"
                  step="10000"
                  defaultValue={current.maxPrice ?? ''}
                  placeholder="Đến"
                  className="h-9 w-full min-w-0 rounded-lg border border-border bg-bg-base px-3 text-sm outline-none transition focus:border-primary"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <p className="mb-2.5 text-xs font-bold text-text-primary">Đánh giá tối thiểu</p>
              <div className="space-y-2">
                {ratingOptions.map((opt) => (
                  <label key={opt.value} className="group flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      name="minRating"
                      value={opt.value}
                      defaultChecked={(current.minRating ?? '') === opt.value}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-text-secondary transition-colors group-hover:text-primary">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div>
              <p className="mb-2.5 text-xs font-bold text-text-primary">Loại sản phẩm</p>
              <div className="space-y-2">
                {[
                  { label: 'Tất cả', value: '' },
                  { label: 'Nổi bật', value: 'true' },
                ].map((opt) => (
                  <label key={opt.value} className="group flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      name="featured"
                      value={opt.value}
                      defaultChecked={(current.featured ?? '') === opt.value}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-text-secondary transition-colors group-hover:text-primary">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="mb-2.5 text-xs font-bold text-text-primary">Sắp xếp</p>
              <select
                name="sort"
                defaultValue={current.sort ?? 'createdAt,desc'}
                className="h-9 w-full rounded-lg border border-border bg-bg-base px-3 text-sm outline-none transition focus:border-primary"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-95"
              >
                Áp dụng
              </button>
              <Link
                href={action}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-bg-base px-4 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
              >
                Xóa
              </Link>
            </div>
          </form>
        </div>

        {/* ── Expert Advice card ─────────────────────────── */}
        <div className="rounded-xl border border-primary/10 bg-primary-subtle p-4">
          <div className="mb-1 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <p className="text-sm font-bold text-primary">Tư vấn chuyên gia</p>
          </div>
          <p className="mb-3 text-xs text-text-secondary">
            Chưa biết chọn sản phẩm nào? Chuyên gia của chúng tôi sẵn sàng giúp bạn tìm lựa chọn
            phù hợp nhất.
          </p>
          <button
            type="button"
            disabled
            className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-white transition hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            title="Tính năng sắp ra mắt"
          >
            Chat tư vấn
          </button>
        </div>
      </div>
    </aside>
  );
}
