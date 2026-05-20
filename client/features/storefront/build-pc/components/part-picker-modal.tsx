import type { BuildPart, CatalogItem } from '../types';
import { PartCard } from './part-card';

type PartPickerModalProps = {
  selectedPart: BuildPart;
  filteredItems: CatalogItem[];
  pendingItemId: string | null;
  selectedItem: CatalogItem | null;
  searchTerm: string;
  selectedBrands: string[];
  selectedSeries: string;
  selectedMinRating: number;
  availableBrands: string[];
  availableSeries: string[];
  availableRatings: number[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onClose: () => void;
  onSelectPendingItem: (id: string) => void;
  onSearchTermChange: (value: string) => void;
  onToggleBrand: (brand: string) => void;
  onSeriesChange: (value: string) => void;
  onMinRatingChange: (value: number) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
};

export function PartPickerModal({
  selectedPart,
  filteredItems,
  pendingItemId,
  selectedItem,
  searchTerm,
  selectedBrands,
  selectedSeries,
  selectedMinRating,
  availableBrands,
  availableSeries,
  availableRatings,
  currentPage,
  totalPages,
  isLoading,
  onClose,
  onSelectPendingItem,
  onSearchTermChange,
  onToggleBrand,
  onSeriesChange,
  onMinRatingChange,
  onResetFilters,
  onPageChange,
}: PartPickerModalProps) {
  const lastPageIndex = Math.max(totalPages - 1, 0);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-on-background/60 p-3 backdrop-blur-sm md:p-5">
      <div className="flex h-full max-h-[900px] w-full max-w-[1400px] flex-col overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-4 py-3">
          <h2 className="text-title-lg font-title-lg text-on-surface">Chọn {selectedPart.label}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full p-1.5 text-on-surface-variant transition hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-outline-variant bg-surface-container-low p-4 lg:block">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <input
                    value={searchTerm}
                    onChange={(event) => onSearchTermChange(event.target.value)}
                    placeholder="Tên sản phẩm..."
                    className="w-full rounded border border-[#ddd] bg-white px-3 py-2 pr-10 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="material-symbols-outlined absolute right-2 top-2 text-outline">
                    search
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Thương hiệu
                </label>
                <div className="flex flex-col gap-2">
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex cursor-pointer items-center gap-2 text-[14px] text-on-surface transition hover:text-primary"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => onToggleBrand(brand)}
                        className="h-4 w-4 rounded border-outline text-primary"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Dòng sản phẩm
                </label>
                <select
                  value={selectedSeries}
                  onChange={(event) => onSeriesChange(event.target.value)}
                  className="w-full rounded border border-[#ddd] bg-white px-3 py-2 text-[13px]"
                >
                  <option>Tất cả</option>
                  {availableSeries.map((series) => (
                    <option key={series}>{series}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Đánh giá tối thiểu
                </label>
                <select
                  value={selectedMinRating}
                  onChange={(event) => onMinRatingChange(Number(event.target.value))}
                  className="w-full rounded border border-[#ddd] bg-white px-3 py-2 text-[13px]"
                >
                  <option value={0}>Tất cả</option>
                  {availableRatings.map((rating) => (
                    <option key={rating} value={rating}>
                      Từ {rating} sao
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={onResetFilters}
                className="mt-2 w-full rounded-sm border border-primary py-1.5 text-[12px] font-semibold text-primary transition hover:bg-primary/5"
              >
                Thiết lập lại
              </button>
            </div>
          </aside>

          <div className="min-w-0 flex-1 overflow-y-auto bg-surface p-3">
            <div className="mb-3 flex flex-col gap-2 lg:hidden">
              <input
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder={`Tìm kiếm ${selectedPart.shortLabel}...`}
                className="w-full rounded border border-[#ddd] bg-white px-3 py-2 text-[13px]"
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[320px] animate-pulse rounded border border-outline-variant bg-surface-container"
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded border border-dashed border-[#ddd] bg-white text-center">
                <div>
                  <span className="material-symbols-outlined mb-2 text-[40px] text-outline">
                    search_off
                  </span>
                  <p className="text-body-md text-on-surface-variant">Không tìm thấy linh kiện phù hợp.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                  {filteredItems.map((item) => (
                    <PartCard
                      key={item.id}
                      item={item}
                      part={selectedPart}
                      isSelected={pendingItemId === item.id}
                      onSelect={onSelectPendingItem}
                    />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <button
                      type="button"
                      onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      aria-label="Trang trước"
                      className="rounded-sm border border-[#ddd] p-2 text-outline transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <span className="text-[13px] text-on-surface-variant">
                      Trang {currentPage} / {lastPageIndex}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPageChange(Math.min(lastPageIndex, currentPage + 1))}
                      disabled={currentPage === lastPageIndex}
                      aria-label="Trang sau"
                      className="rounded-sm border border-[#ddd] p-2 text-outline transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface px-4 py-3 md:flex-row md:items-center md:justify-end">
          <p className="hidden text-[14px] text-on-surface-variant md:block">
            {isLoading ? 'Đang tải sản phẩm...' : `Đang hiển thị ${filteredItems.length} sản phẩm`}
          </p>
          <a
            href={selectedItem ? `/product/${selectedItem.slug}` : '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!selectedItem}
            onClick={(event) => {
              if (!selectedItem) {
                event.preventDefault();
              }
            }}
            className="rounded-sm border border-outline-variant px-3 py-1.5 text-[12px] font-semibold text-on-surface transition hover:border-primary hover:text-primary aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Xem chi tiết
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-primary px-3 py-1.5 text-[12px] font-semibold text-primary transition hover:bg-primary/10"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
