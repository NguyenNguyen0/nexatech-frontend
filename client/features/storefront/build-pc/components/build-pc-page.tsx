'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { fetchBuildPcCatalog, fetchBuildPcSuggestions } from '../services/build-pc-api';
import type { BuildPart, BuildSelection, CatalogItem, PartKey, SuggestedBuild } from '../types';

const buildParts: BuildPart[] = [
  {
    key: 'cpu',
    label: 'Vi xử lý',
    shortLabel: 'CPU',
    icon: 'memory',
    description: 'Bộ não của toàn bộ hệ thống',
  },
  {
    key: 'mainboard',
    label: 'Bo mạch chủ',
    shortLabel: 'Mainboard',
    icon: 'developer_board',
    description: 'Nền tảng kết nối các linh kiện',
  },
  {
    key: 'ram',
    label: 'RAM',
    shortLabel: 'RAM',
    icon: 'memory_alt',
    description: 'Bộ nhớ đa nhiệm cho máy',
  },
  {
    key: 'hdd',
    label: 'Ổ HDD',
    shortLabel: 'HDD',
    icon: 'storage',
    description: 'Lưu trữ dung lượng lớn',
  },
  {
    key: 'ssd',
    label: 'Ổ SSD',
    shortLabel: 'SSD',
    icon: 'sd_storage',
    description: 'Tăng tốc khởi động và tải ứng dụng',
  },
  {
    key: 'gpu',
    label: 'Card đồ họa',
    shortLabel: 'VGA',
    icon: 'videogame_asset',
    description: 'Xử lý hình ảnh và game',
  },
  {
    key: 'psu',
    label: 'Nguồn',
    shortLabel: 'PSU',
    icon: 'power',
    description: 'Cấp điện ổn định cho toàn bộ máy',
  },
];

const presetLabels = ['Cấu hình 1', 'Cấu hình 2', 'Cấu hình 3'];

export function BuildPcPage() {
  // — API data state —
  const [suggestedBuilds, setSuggestedBuilds] = useState<SuggestedBuild[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // — Config / selection state —
  const [activeConfigIndex, setActiveConfigIndex] = useState(0);
  const [configs, setConfigs] = useState<BuildSelection[]>([{}, {}, {}]);
  const [selectedPartKey, setSelectedPartKey] = useState<PartKey | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState('Tất cả');
  const [selectedCompatibility, setSelectedCompatibility] = useState('Tất cả');

  useEffect(() => {
    void (async () => {
      try {
        const [builds, items] = await Promise.all([
          fetchBuildPcSuggestions(),
          fetchBuildPcCatalog(),
        ]);
        setSuggestedBuilds(builds);
        setCatalog(items);
      } catch (err) {
        setDataError(err instanceof Error ? err.message : 'Không thể tải dữ liệu Build PC');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const activeConfig = configs[activeConfigIndex] ?? {};
  const selectedPart = buildParts.find((part) => part.key === selectedPartKey) ?? null;
  const itemsForSelectedPart = catalog.filter((item) => item.partKey === selectedPartKey);
  const availableBrands = [...new Set(itemsForSelectedPart.map((item) => item.brand))];
  const availableSeries = [...new Set(itemsForSelectedPart.map((item) => item.series))];
  const availableCompatibility = [...new Set(itemsForSelectedPart.map((item) => item.compatibility))];

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return itemsForSelectedPart.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.brand.toLowerCase().includes(normalizedSearch);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand);
      const matchesSeries = selectedSeries === 'Tất cả' || item.series === selectedSeries;
      const matchesCompatibility =
        selectedCompatibility === 'Tất cả' || item.compatibility === selectedCompatibility;

      return matchesSearch && matchesBrand && matchesSeries && matchesCompatibility;
    });
  }, [
    itemsForSelectedPart,
    searchTerm,
    selectedBrands,
    selectedCompatibility,
    selectedSeries,
  ]);

  const total = Object.values(activeConfig).reduce((sum, item) => sum + (item?.price ?? 0), 0);
  const selectedCount = Object.keys(activeConfig).length;
  const pendingItem = filteredItems.find((item) => item.id === pendingItemId) ?? null;

  const openPartModal = (partKey: PartKey) => {
    setSelectedPartKey(partKey);
    setPendingItemId(activeConfig[partKey]?.id ?? null);
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedSeries('Tất cả');
    setSelectedCompatibility('Tất cả');
  };

  const closePartModal = () => {
    setSelectedPartKey(null);
    setPendingItemId(null);
  };

  const confirmSelection = () => {
    if (!selectedPartKey || !pendingItem) return;

    setConfigs((current) =>
      current.map((config, index) =>
        index === activeConfigIndex
          ? {
              ...config,
              [selectedPartKey]: pendingItem,
            }
          : config,
      ),
    );
    closePartModal();
  };

  const clearActiveConfig = () => {
    setConfigs((current) =>
      current.map((config, index) => (index === activeConfigIndex ? {} : config)),
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand],
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedSeries('Tất cả');
    setSelectedCompatibility('Tất cả');
  };

  const buildPcTheme = {
    '--color-primary': 'var(--color-storefront-primary)',
    '--color-primary-container': 'var(--color-storefront-primary-hover)',
    '--color-primary-fixed': 'var(--color-storefront-primary-soft)',
    '--color-on-primary': '#ffffff',
  } as CSSProperties;

  return (
    <div className="bg-surface-container-low pb-12" style={buildPcTheme}>
      <section className="mx-auto w-full max-w-[1200px] px-4 py-6">
        <div className="mb-5">
          <h1 className="text-display-lg font-display-lg text-primary">Xây dựng cấu hình PC</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Tự tay lắp ráp bộ máy tính mơ ước của bạn
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          {['PC Gaming', 'PC Đồ họa', 'PC Văn phòng'].map((category, index) => (
            <button
              key={category}
              type="button"
              className={cn(
                'rounded-sm px-5 py-2 text-[13px] font-bold transition-colors',
                index === 0
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-[#e8ecf1] text-on-surface-variant hover:bg-[#dce3eb]',
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {dataError ? (
            <div className="col-span-5 rounded-md border border-[#fde8e8] bg-[#fff5f5] px-4 py-6 text-center text-[13px] text-[#e30019]">
              <span className="material-symbols-outlined mb-1 text-[28px]">error_outline</span>
              <p className="font-semibold">Không thể tải dữ liệu</p>
              <p className="mt-0.5 text-[#666]">{dataError}</p>
            </div>
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-md border border-[#e8e8e8] bg-[#f5f5f5]"
              />
            ))
          ) : (
          suggestedBuilds.map((build) => (
            <article
              key={build.id}
              className="group relative flex h-full flex-col rounded-md border border-[#e8e8e8] bg-white p-2.5 transition-all hover:shadow-md"
            >
              {build.savingsLabel ? (
              <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-[#e30019] px-1.5 py-[1px] text-[10px] font-bold text-white">
                {build.savingsLabel}
              </span>
              ) : null}
              <button
                type="button"
                aria-label={`Yêu thích ${build.name}`}
                className="absolute right-2 top-2 z-10 text-outline-variant transition hover:text-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>

              <div className="relative mb-2 aspect-square overflow-hidden rounded bg-[#f7f7f7] p-2.5">
                <img
                  src={build.image}
                  alt={build.name}
                  className="mx-auto h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
              </div>

              <h2 className="mb-1.5 min-h-9 text-[12px] font-medium leading-[1.4] text-[#333] line-clamp-2">
                {build.name}
              </h2>

              <div className="mt-auto">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-bold text-[#e30019]">
                    {formatCurrency(build.price)}
                  </span>
                </div>
                <p className="text-[10px] text-[#999] line-through">
                  {formatCurrency(build.originalPrice)}
                </p>
              </div>

              <button
                type="button"
                className="mt-2 w-full rounded-sm border border-[#004d75] py-1 text-[11px] font-semibold text-[#004d75] transition hover:bg-[#004d75] hover:text-white"
              >
                Thêm vào giỏ
              </button>
            </article>
          ))
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1200px] gap-4 px-4 md:grid-cols-[minmax(0,1fr)_346px]">
        <div>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1">
              {presetLabels.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveConfigIndex(index)}
                  className={cn(
                    'rounded-sm px-3 py-1 text-[12px] font-bold transition-colors',
                    index === activeConfigIndex
                      ? 'bg-primary text-white'
                      : 'bg-[#e8ecf1] text-[#666] hover:bg-[#dce3eb]',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={clearActiveConfig}
                className="inline-flex items-center gap-1 rounded-sm bg-primary px-3 py-1 text-[12px] font-bold text-white transition hover:bg-primary-dark"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Tạo lại
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-sm border border-primary px-3 py-1 text-[12px] font-bold text-primary transition hover:bg-primary/5"
              >
                Tải cấu hình
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {buildParts.map((part) => {
              const selectedItem = activeConfig[part.key];

              return (
                <article
                  key={part.key}
                  className="flex min-h-20 items-center justify-between gap-4 rounded-md border border-[#e8e8e8] bg-white px-3 py-2 transition hover:border-primary/50"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="w-16 shrink-0">
                      <p className="text-label-sm font-bold uppercase text-on-surface">
                        {part.shortLabel}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-dashed border-[#ddd] bg-white">
                      <span className="material-symbols-outlined text-outline">{part.icon}</span>
                    </div>

                    <div className="min-w-0">
                      {selectedItem ? (
                        <>
                          <p className="truncate text-body-md font-medium text-on-surface">
                            {selectedItem.name}
                          </p>
                          <p className="text-label-sm text-on-surface-variant">
                            {formatCurrency(selectedItem.price)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-body-md italic text-outline">Vui lòng chọn linh kiện</p>
                          <p className="hidden text-label-sm text-on-surface-variant sm:block">
                            {part.description}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openPartModal(part.key)}
                    className="shrink-0 rounded-sm bg-primary px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-primary-dark"
                  >
                    {selectedItem ? 'Đổi' : 'Chọn'}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <aside>
          <div className="sticky top-28 rounded-md border border-[#e8e8e8] bg-white p-4 shadow-sm">
            <h2 className="mb-4 border-b border-outline-variant pb-2 text-title-lg font-title-lg text-primary">
              Build Summary
            </h2>

            {selectedCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-md bg-[#f5f5f5] opacity-40">
                  <span className="material-symbols-outlined text-[64px] text-outline">
                    desktop_windows
                  </span>
                </div>
                <p className="max-w-52 text-label-sm text-outline">
                  Chưa có linh kiện nào trong danh sách cấu hình của bạn.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {buildParts.map((part) => {
                  const selectedItem = activeConfig[part.key];

                  if (!selectedItem) return null;

                  return (
                    <div
                      key={part.key}
                      className="flex items-start justify-between gap-3 border-b border-outline-variant/70 pb-3 last:border-b-0"
                    >
                      <div>
                        <p className="text-label-sm font-bold uppercase text-on-surface-variant">
                          {part.shortLabel}
                        </p>
                        <p className="text-label-sm text-on-surface">{selectedItem.name}</p>
                      </div>
                      <span className="shrink-0 text-label-sm font-medium text-primary">
                        {formatCurrency(selectedItem.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex items-end justify-between border-t border-outline-variant pt-4">
                <span className="font-bold text-on-surface-variant">Tổng tiền:</span>
                <span className="text-headline-md font-display-lg text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-[13px] font-bold text-white transition hover:bg-primary-dark"
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                Nhận tư vấn từ chuyên gia
              </button>

              <button
                type="button"
                disabled={selectedCount === 0}
                className="w-full rounded-md border border-primary py-2 text-[12px] font-bold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-[#ddd] disabled:text-[#999]"
              >
                Thêm tất cả vào giỏ
              </button>

              <p className="text-center text-[11px] text-outline">
                Giá đã bao gồm VAT và các chương trình khuyến mãi hiện có.
              </p>
            </div>
          </div>
        </aside>
      </section>

      {selectedPart ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-on-background/60 p-3 backdrop-blur-sm md:p-5">
          <div className="flex h-full max-h-[900px] w-full max-w-[1400px] flex-col overflow-hidden rounded-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-4 py-3">
              <h2 className="text-title-lg font-title-lg text-on-surface">
                Chọn {selectedPart.label}
              </h2>
              <button
                type="button"
                onClick={closePartModal}
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
                        onChange={(event) => setSearchTerm(event.target.value)}
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
                            onChange={() => toggleBrand(brand)}
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
                      onChange={(event) => setSelectedSeries(event.target.value)}
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
                      onChange={(event) => setSelectedCompatibility(event.target.value)}
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
                    onClick={resetFilters}
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
                    onChange={(event) => setSearchTerm(event.target.value)}
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
                      <p className="text-body-md text-on-surface-variant">
                        Không tìm thấy linh kiện phù hợp.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPendingItemId(item.id)}
                        className={cn(
                          'group flex h-full flex-col overflow-hidden rounded border bg-white text-left transition hover:shadow-md',
                          pendingItemId === item.id
                            ? 'border-primary ring-1 ring-primary/50'
                            : 'border-[#e8e8e8]',
                        )}
                      >
                        <div className="relative flex aspect-square items-center justify-center bg-white p-2.5">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
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
                  onClick={closePartModal}
                  className="rounded-sm border border-[#ddd] px-3 py-1.5 text-[12px] font-semibold text-[#666] transition hover:bg-[#f5f5f5]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmSelection}
                  disabled={!pendingItem}
                  className="rounded-sm bg-primary px-5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-[#ccc]"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
