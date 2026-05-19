'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { fetchBuildPcCatalog, fetchBuildPcSuggestions } from '../services/build-pc-api';
import type { BuildPart, BuildSelection, CatalogItem, PartKey, SuggestedBuild } from '../types';
import { BuildPartRow } from './build-part-row';
import { BuildPcHeader } from './build-pc-header';
import { BuildSummary } from './build-summary';
import { ConfigPresetBar } from './config-preset-bar';
import { PartPickerModal } from './part-picker-modal';
import { SuggestedBuildGrid } from './suggested-build-grid';

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
      <section className="mx-auto w-full max-w-container-max px-4 py-6">
        <BuildPcHeader />

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

        <SuggestedBuildGrid
          suggestedBuilds={suggestedBuilds}
          isLoading={isLoading}
          dataError={dataError}
        />
      </section>

      <section className="mx-auto grid w-full max-w-container-max gap-4 px-4 md:grid-cols-[minmax(0,1fr)_346px]">
        <div>
          <ConfigPresetBar
            presetLabels={presetLabels}
            activeConfigIndex={activeConfigIndex}
            onSelectPreset={setActiveConfigIndex}
            onClearActiveConfig={clearActiveConfig}
          />

          <div className="space-y-2">
            {buildParts.map((part) => (
              <BuildPartRow
                key={part.key}
                part={part}
                selectedItem={activeConfig[part.key]}
                onChoose={() => openPartModal(part.key)}
              />
            ))}
          </div>
        </div>

        <BuildSummary
          buildParts={buildParts}
          activeConfig={activeConfig}
          selectedCount={selectedCount}
          total={total}
        />
      </section>

      {selectedPart ? (
        <PartPickerModal
          selectedPart={selectedPart}
          itemsForSelectedPart={itemsForSelectedPart}
          filteredItems={filteredItems}
          pendingItemId={pendingItemId}
          searchTerm={searchTerm}
          selectedBrands={selectedBrands}
          selectedSeries={selectedSeries}
          selectedCompatibility={selectedCompatibility}
          availableBrands={availableBrands}
          availableSeries={availableSeries}
          availableCompatibility={availableCompatibility}
          onClose={closePartModal}
          onConfirm={confirmSelection}
          onSelectPendingItem={setPendingItemId}
          onSearchTermChange={setSearchTerm}
          onToggleBrand={toggleBrand}
          onSeriesChange={setSelectedSeries}
          onCompatibilityChange={setSelectedCompatibility}
          onResetFilters={resetFilters}
          hasPendingItem={Boolean(pendingItem)}
        />
      ) : null}
    </div>
  );
}
