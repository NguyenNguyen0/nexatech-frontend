/* eslint-disable @next/next/no-img-element */

import { cn, formatCurrency } from '@/lib/utils';
import type { BuildPart, CatalogItem } from '../types';

type PartPickerModalProps = {
  selectedPart: BuildPart;
  itemsForSelectedPart: CatalogItem[];
  filteredItems: CatalogItem[];
  pendingItemId: string | null;
  searchTerm: string;
  selectedBrands: string[];
  selectedSeries: string;
  selectedCompatibility: string;
  availableBrands: string[];
  availableSeries: string[];
  availableCompatibility: string[];
  onClose: () => void;
  onConfirm: () => void;
  onSelectPendingItem: (id: string) => void;
  onSearchTermChange: (value: string) => void;
  onToggleBrand: (brand: string) => void;
  onSeriesChange: (value: string) => void;
  onCompatibilityChange: (value: string) => void;
  onResetFilters: () => void;
  hasPendingItem: boolean;
};

export function PartPickerModal({
  selectedPart,
  itemsForSelectedPart,
  filteredItems,
  pendingItemId,
  searchTerm,
  selectedBrands,
  selectedSeries,
  selectedCompatibility,
  availableBrands,
  availableSeries,
  availableCompatibility,
  onClose,
  onConfirm,
  onSelectPendingItem,
  onSearchTermChange,
  onToggleBrand,
  onSeriesChange,
  onCompatibilityChange,
  onResetFilters,
  hasPendingItem,
}: PartPickerModalProps) {
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
                  Tương thích
                </label>
                <select
                  value={selectedCompatibility}
                  onChange={(event) => onCompatibilityChange(event.target.value)}
                  className="w-full rounded border border-[#ddd] bg-white px-3 py-2 text-[13px]"
                >
                  <option>Tất cả</option>
                  {availableCompatibility.map((compatibility) => (
                    <option key={compatibility}>{compatibility}</option>
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

            {filteredItems.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded border border-dashed border-[#ddd] bg-white text-center">
                <div>
                  <span className="material-symbols-outlined mb-2 text-[40px] text-outline">
                    search_off
                  </span>
                  <p className="text-body-md text-on-surface-variant">Không tìm thấy linh kiện phù hợp.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectPendingItem(item.id)}
                    className={cn(
                      'group flex h-full flex-col overflow-hidden rounded border bg-white text-left transition hover:shadow-md',
                      pendingItemId === item.id ? 'border-primary ring-1 ring-primary/50' : 'border-[#e8e8e8]',
                    )}
                  >
                    <div className="relative flex aspect-square items-center justify-center bg-white p-2.5">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded bg-[#f5f5f5]">
                          <span className="material-symbols-outlined text-[52px] text-outline">
                            {selectedPart.icon}
                          </span>
                        </div>
                      )}

                      {item.badge ? (
                        <span className="absolute left-2 top-2 rounded bg-secondary-container px-2 py-0.5 text-[11px] font-semibold text-on-secondary-container">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-2.5">
                      <h3 className="mb-1 min-h-10 text-[15px] font-semibold leading-5 text-on-surface">
                        {item.name}
                      </h3>
                      <p className="mb-3 text-label-sm text-outline">
                        {item.compatibility} · {item.series}
                      </p>
                      <div className="mt-auto">
                        <div className="mb-3 flex flex-col">
                          <span className="text-[18px] font-bold leading-6 text-secondary">
                            {formatCurrency(item.price)}
                          </span>
                          {item.originalPrice ? (
                            <span className="text-label-sm text-outline line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          ) : null}
                        </div>
                        <span className="block w-full rounded-sm bg-primary py-1.5 text-center text-[13px] font-semibold text-white transition group-hover:bg-primary-dark">
                          Chọn
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface px-4 py-3 md:flex-row md:items-center md:justify-end">
          <p className="hidden text-[14px] text-on-surface-variant md:block">
            Đang hiển thị {filteredItems.length} trong số {itemsForSelectedPart.length} sản phẩm
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-[#ddd] px-3 py-1.5 text-[12px] font-semibold text-[#666] transition hover:bg-[#f5f5f5]"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!hasPendingItem}
              className="rounded-sm bg-primary px-5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-[#ccc]"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
