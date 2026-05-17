'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, MessageCircle } from 'lucide-react';
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
    categorySlug?: string;
    subcategorySlug?: string;
    brandSlug?: string;
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
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(current.categorySlug ?? '');
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const resolveCategoryId = (slugOrId: string): string | undefined => {
    if (!slugOrId) return undefined;
    return categories.find((category) => category.slug === slugOrId || category.id === slugOrId)?.id;
  };

  // Load subcategories when category changes
  useEffect(() => {
    const selectedCategoryId = resolveCategoryId(selectedCategorySlug);
    const selectedCategoryKey = selectedCategorySlug || selectedCategoryId;

    if (selectedCategoryKey) {
      setLoadingSubcategories(true);
      fetchSubcategories(selectedCategoryKey)
        .then(setSubcategories)
        .catch(() => setSubcategories([]))
        .finally(() => setLoadingSubcategories(false));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategorySlug, categories]);
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24 space-y-4">
        {/* ── Filter panel ──────────────────────────────────── */}
        <div className="bg-surface rounded-xl border border-outline-variant p-4 md:p-6 mb-6 lg:mb-0 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-title-md font-title-md text-on-surface flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-on-surface-variant" />
              Bộ lọc tìm kiếm
            </h2>
          </div>

          <form action={action} method="get" className="space-y-6">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="size" value={current.size ?? '12'} />
            <input type="hidden" name="subcategorySlug" value={current.subcategorySlug ?? ''} />

            {/* Keyword */}
            {showKeyword ? (
              <div className="space-y-3">
                <h3 className="text-label-lg font-label-lg text-on-surface">Từ khóa</h3>
                <input
                  name="keyword"
                  defaultValue={current.keyword ?? ''}
                  placeholder="Tìm sản phẩm..."
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md outline-none transition focus:border-primary text-on-surface"
                />
              </div>
            ) : current.keyword ? (
              <input type="hidden" name="keyword" value={current.keyword} />
            ) : null}

            {/* Category & Subcategory */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-label-lg font-label-lg text-on-surface">Danh mục</h3>
                <div
                  className={
                    categories.length > 6 ? 'max-h-80 space-y-3 overflow-y-auto pr-1' : 'space-y-3'
                  }
                >
                  {/* "All categories" option */}
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="categorySlug"
                      value=""
                      checked={selectedCategorySlug === ''}
                      onChange={(e) => setSelectedCategorySlug(e.target.value)}
                      className="h-4 w-4 accent-primary text-primary"
                    />
                    <span className="text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                      Tất cả
                    </span>
                  </label>

                  {/* Categories with subcategories */}
                  {categories.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <label className="group flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          name="categorySlug"
                          value={cat.slug ?? cat.id}
                          checked={selectedCategorySlug === (cat.slug ?? cat.id)}
                          onChange={(e) => setSelectedCategorySlug(e.target.value)}
                          className="h-4 w-4 accent-primary text-primary"
                        />
                        <span className="text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                          {cat.name}
                        </span>
                      </label>

                      {/* Subcategories (show when parent is selected) */}
                      {selectedCategorySlug === (cat.slug ?? cat.id) && subcategories.length > 0 && (
                        <div className="ml-7 mt-2 space-y-3 border-l-2 border-outline-variant pl-4">
                          {loadingSubcategories ? (
                            <div className="py-1 text-label-sm text-on-surface-variant">Đang tải...</div>
                          ) : (
                            <>
                              <label className="group flex cursor-pointer items-center gap-3">
                                <input
                                  type="radio"
                                  name="subcategorySlug"
                                  value=""
                                  defaultChecked={!current.subcategorySlug}
                                  className="h-4 w-4 accent-primary text-primary"
                                />
                                <span className="text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                                  Tất cả
                                </span>
                              </label>
                              {subcategories.map((subcat) => (
                                <label
                                  key={subcat.id}
                                  className="group flex cursor-pointer items-center gap-3"
                                >
                                  <input
                                    type="radio"
                                    name="subcategorySlug"
                                    value={subcat.slug ?? subcat.id}
                                    defaultChecked={current.subcategorySlug === (subcat.slug ?? subcat.id)}
                                    className="h-4 w-4 accent-primary text-primary"
                                  />
                                  <span className="text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
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
              <div className="pt-4 border-t border-outline-variant">
                <h3 className="mb-3 text-label-lg font-label-lg text-on-surface">Thương hiệu</h3>
                <div
                  className={
                    brands.length > 6 ? 'max-h-44 space-y-3 overflow-y-auto pr-1' : 'space-y-3'
                  }
                >
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="brandSlug"
                      value=""
                      defaultChecked={!current.brandSlug}
                      className="h-4 w-4 accent-primary text-primary"
                    />
                    <span className="text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                      Tất cả
                    </span>
                  </label>
                  {brands.map((brand) => (
                    <label key={brand.id} className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name="brandSlug"
                        value={brand.slug ?? brand.id}
                        defaultChecked={current.brandSlug === (brand.slug ?? brand.id)}
                        className="h-4 w-4 accent-primary text-primary"
                      />
                      <span className="text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                        {brand.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            <div className="pt-4 border-t border-outline-variant">
              <h3 className="mb-3 text-label-lg font-label-lg text-on-surface">Khoảng giá</h3>
              <div className="flex items-center gap-2">
                <input
                  name="minPrice"
                  type="number"
                  min="0"
                  step="10000"
                  defaultValue={current.minPrice ?? ''}
                  placeholder="Từ"
                  className="h-10 w-full min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md outline-none transition focus:border-primary text-on-surface"
                />
                <span className="shrink-0 text-on-surface-variant">—</span>
                <input
                  name="maxPrice"
                  type="number"
                  min="0"
                  step="10000"
                  defaultValue={current.maxPrice ?? ''}
                  placeholder="Đến"
                  className="h-10 w-full min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md outline-none transition focus:border-primary text-on-surface"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="pt-4 border-t border-outline-variant">
              <h3 className="mb-3 text-label-lg font-label-lg text-on-surface">Đánh giá tối thiểu</h3>
              <div className="space-y-3">
                {ratingOptions.map((opt) => (
                  <label key={opt.value} className="group flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="minRating"
                      value={opt.value}
                      defaultChecked={(current.minRating ?? '') === opt.value}
                      className="h-4 w-4 accent-primary text-primary"
                    />
                    <span className="text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div className="pt-4 border-t border-outline-variant">
              <h3 className="mb-3 text-label-lg font-label-lg text-on-surface">Loại sản phẩm</h3>
              <div className="space-y-3">
                {[
                  { label: 'Tất cả', value: '' },
                  { label: 'Nổi bật', value: 'true' },
                ].map((opt) => (
                  <label key={opt.value} className="group flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="featured"
                      value={opt.value}
                      defaultChecked={(current.featured ?? '') === opt.value}
                      className="h-4 w-4 accent-primary text-primary"
                    />
                    <span className="text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="hidden">
              <select
                name="sort"
                defaultValue={current.sort ?? 'createdAt,desc'}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant">
              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-primary text-on-primary text-label-lg font-label-lg transition hover:bg-primary/90 active:scale-95"
              >
                Áp dụng
              </button>
              <Link
                href={action}
                className="w-full flex items-center justify-center h-10 rounded-lg border border-outline-variant bg-surface text-on-surface-variant text-label-lg font-label-lg transition hover:border-primary hover:text-primary"
              >
                Xóa bộ lọc
              </Link>
            </div>
          </form>
        </div>

        {/* ── Expert Advice card ─────────────────────────── */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <p className="text-label-lg font-label-lg text-primary">Tư vấn chuyên gia</p>
          </div>
          <p className="mb-4 text-body-sm text-on-surface-variant">
            Chưa biết chọn sản phẩm nào? Chuyên gia của chúng tôi sẵn sàng giúp bạn tìm lựa chọn
            phù hợp nhất.
          </p>
          <button
            type="button"
            disabled
            className="w-full rounded-lg bg-primary py-2.5 text-label-sm font-label-sm text-on-primary transition hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            title="Tính năng sắp ra mắt"
          >
            Chat tư vấn
          </button>
        </div>
      </div>
    </aside>
  );
}
