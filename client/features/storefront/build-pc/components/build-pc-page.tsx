'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { toast } from 'sonner';
import { PRODUCT_CONSULT_CHAT_EVENT } from '@/components/shared/chat-widget';
import { getApiErrorMessage, getCart, updateCartItem } from '@/features/cart/services/cart-api';
import { cn, formatCurrency } from '@/lib/utils';
import { fetchBuildPcSuggestions, fetchPartsByKey } from '../services/build-pc-api';
import type { BuildPart, BuildSelection, CatalogItem, PartKey, SuggestedBuild } from '../types';
import { BuildPartRow } from './build-part-row';
import { BuildPcHeader } from './build-pc-header';
import { BuildSummary } from './build-summary';
import { ConfigPresetBar } from './config-preset-bar';
import { PartPickerModal } from './part-picker-modal';
import { SuggestedBuildGrid } from './suggested-build-grid';

const ALL_SERIES_LABEL = 'Tất cả';
const ALL_PRICE_RANGE = 'all';

type PriceRangeOption = {
  value: string;
  label: string;
  min?: number;
  max?: number;
};

const PRICE_RANGE_PRESETS: PriceRangeOption[] = [
  { value: 'under-1m', label: 'Dưới 1 triệu', max: 1_000_000 },
  { value: '1m-3m', label: '1 - 3 triệu', min: 1_000_000, max: 3_000_000 },
  { value: '3m-5m', label: '3 - 5 triệu', min: 3_000_000, max: 5_000_000 },
  { value: '5m-10m', label: '5 - 10 triệu', min: 5_000_000, max: 10_000_000 },
  { value: '10m-20m', label: '10 - 20 triệu', min: 10_000_000, max: 20_000_000 },
  { value: 'over-20m', label: 'Trên 20 triệu', min: 20_000_000 },
];

function sameStringArray(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

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
    description: 'Nền tảng kết nối các linh kiện chính',
  },
  {
    key: 'vga',
    label: 'VGA',
    shortLabel: 'VGA',
    icon: 'view_in_ar',
    description: 'Card đồ họa cho game và tác vụ sáng tạo',
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
    key: 'pc-case',
    label: 'Case',
    shortLabel: 'Case',
    icon: 'deployed_code',
    description: 'Vỏ máy tính và khung lắp đặt linh kiện',
  },
  {
    key: 'monitor',
    label: 'Màn hình',
    shortLabel: 'Monitor',
    icon: 'monitor',
    description: 'Thiết bị hiển thị cho hệ thống',
  },
  {
    key: 'power-supply-psu',
    label: 'Nguồn',
    shortLabel: 'PSU',
    icon: 'power',
    description: 'Cấp điện ổn định cho toàn bộ máy',
  },
  {
    key: 'mouse',
    label: 'Chuột',
    shortLabel: 'Mouse',
    icon: 'mouse',
    description: 'Chuột chơi game hoặc làm việc cho bộ PC',
  },
  {
    key: 'keyboard',
    label: 'Bàn phím',
    shortLabel: 'Keyboard',
    icon: 'keyboard',
    description: 'Bàn phím cơ, không dây hoặc văn phòng',
  },
  {
    key: 'chair',
    label: 'Ghế',
    shortLabel: 'Chair',
    icon: 'chair',
    description: 'Ghế gaming hoặc công thái học',
  },
  {
    key: 'headphones',
    label: 'Tai nghe',
    shortLabel: 'Headset',
    icon: 'headphones',
    description: 'Tai nghe gaming, không dây hoặc chống ồn',
  },
];

const presetLabels = ['Cấu hình 1', 'Cấu hình 2', 'Cấu hình 3'];
const suggestedBuildCategories = [
  { label: 'PC Gaming', slug: 'gaming-pc' },
  { label: 'PC Đồ họa', slug: 'graphic-pc' },
  { label: 'PC Văn phòng', slug: 'office-pc' },
] as const;

export function BuildPcPage() {
  const [suggestedBuilds, setSuggestedBuilds] = useState<SuggestedBuild[]>([]);
  const [modalItems, setModalItems] = useState<CatalogItem[]>([]);
  const [isSuggestedBuildsLoading, setIsSuggestedBuildsLoading] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeSuggestedCategory, setActiveSuggestedCategory] = useState<string>('gaming-pc');

  const [activeConfigIndex, setActiveConfigIndex] = useState(0);
  const [configs, setConfigs] = useState<BuildSelection[]>([{}, {}, {}]);
  const [selectedPartKey, setSelectedPartKey] = useState<PartKey | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState(ALL_SERIES_LABEL);
  const [selectedMinRating, setSelectedMinRating] = useState(0);
  const [selectedPriceRange, setSelectedPriceRange] = useState(ALL_PRICE_RANGE);
  const [modalPage, setModalPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [isAddingConfigToCart, setIsAddingConfigToCart] = useState(false);

  useEffect(() => {
    void (async () => {
      setIsSuggestedBuildsLoading(true);
      try {
        const builds = await fetchBuildPcSuggestions(activeSuggestedCategory);
        setSuggestedBuilds(builds);
        setDataError(null);
      } catch (err) {
        setDataError(err instanceof Error ? err.message : 'Không thể tải dữ liệu Build PC');
      } finally {
        setIsSuggestedBuildsLoading(false);
      }
    })();
  }, [activeSuggestedCategory]);

  useEffect(() => {
    if (!selectedPartKey) {
      setModalItems([]);
      setIsCatalogLoading(false);
      return;
    }

    void (async () => {
      setIsCatalogLoading(true);
      try {
        const result = await fetchPartsByKey(selectedPartKey, modalPage);
        setModalItems(result.items);
        setTotalPages(result.totalPages);
        setDataError(null);
      } catch (err) {
        setModalItems([]);
        setTotalPages(1);
        setDataError(err instanceof Error ? err.message : 'Không thể tải dữ liệu Build PC');
      } finally {
        setIsCatalogLoading(false);
      }
    })();
  }, [selectedPartKey, modalPage]);

  const activeConfig = configs[activeConfigIndex] ?? {};
  const selectedPart = buildParts.find((part) => part.key === selectedPartKey) ?? null;
  const activePriceRange = PRICE_RANGE_PRESETS.find((range) => range.value === selectedPriceRange);

  const applyFilters = (
    items: CatalogItem[],
    options: {
      includeBrands?: boolean;
      includeSeries?: boolean;
      includeRating?: boolean;
      includePrice?: boolean;
      includeSearch?: boolean;
    } = {},
  ) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        options.includeSearch === false ||
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.brand.toLowerCase().includes(normalizedSearch);
      const matchesBrand =
        options.includeBrands === false || selectedBrands.length === 0 || selectedBrands.includes(item.brand);
      const matchesSeries =
        options.includeSeries === false || selectedSeries === ALL_SERIES_LABEL || item.series === selectedSeries;
      const matchesRating =
        options.includeRating === false || selectedMinRating <= 0 || item.averageRating >= selectedMinRating;
      const matchesMinPrice =
        options.includePrice === false || activePriceRange?.min === undefined || item.price >= activePriceRange.min;
      const matchesMaxPrice =
        options.includePrice === false || activePriceRange?.max === undefined || item.price < activePriceRange.max;

      return matchesSearch && matchesBrand && matchesSeries && matchesRating && matchesMinPrice && matchesMaxPrice;
    });
  };

  const availableBrands = [
    ...new Set(
      applyFilters(modalItems, { includeBrands: false }).map((item) => item.brand).filter(Boolean),
    ),
  ];
  const availableSeries = [
    ...new Set(
      applyFilters(modalItems, { includeSeries: false }).map((item) => item.series).filter(Boolean),
    ),
  ];
  const availableRatings = [
    ...new Set(
      applyFilters(modalItems, { includeRating: false })
        .map((item) => Math.floor(item.averageRating))
        .filter((rating) => rating > 0),
    ),
  ].sort((a, b) => b - a);
  const availablePriceRanges = PRICE_RANGE_PRESETS.filter((range) =>
    applyFilters(modalItems, { includePrice: false }).some((item) => {
      const overMin = range.min === undefined || item.price >= range.min;
      const underMax = range.max === undefined || item.price < range.max;
      return overMin && underMax;
    }),
  );

  const filteredItems = useMemo(() => {
    return applyFilters(modalItems);
  }, [activePriceRange?.max, activePriceRange?.min, modalItems, searchTerm, selectedBrands, selectedMinRating, selectedSeries]);

  useEffect(() => {
    setSelectedBrands((current) => {
      const next = current.filter((brand) => availableBrands.includes(brand));
      return sameStringArray(current, next) ? current : next;
    });
    if (selectedSeries !== ALL_SERIES_LABEL && !availableSeries.includes(selectedSeries)) {
      setSelectedSeries(ALL_SERIES_LABEL);
    }
    if (selectedMinRating > 0 && !availableRatings.includes(selectedMinRating)) {
      setSelectedMinRating(0);
    }
    if (selectedPriceRange !== ALL_PRICE_RANGE && !availablePriceRanges.some((range) => range.value === selectedPriceRange)) {
      setSelectedPriceRange(ALL_PRICE_RANGE);
    }
  }, [availableBrands, availablePriceRanges, availableRatings, availableSeries, selectedMinRating, selectedPriceRange, selectedSeries]);

  const total = Object.values(activeConfig).reduce((sum, item) => sum + (item?.price ?? 0), 0);
  const selectedCount = Object.keys(activeConfig).length;
  const selectedItemForModal = selectedPartKey ? activeConfig[selectedPartKey] ?? null : null;

  const openPartModal = (partKey: PartKey) => {
    setSelectedPartKey(partKey);
    setPendingItemId(activeConfig[partKey]?.id ?? null);
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedSeries(ALL_SERIES_LABEL);
    setSelectedMinRating(0);
    setSelectedPriceRange(ALL_PRICE_RANGE);
    setModalPage(0);
    setTotalPages(1);
  };

  const closePartModal = () => {
    setSelectedPartKey(null);
    setPendingItemId(null);
  };

  const selectAndConfirm = (itemId: string) => {
    if (!selectedPartKey) return;

    const selectedItem = modalItems.find((item) => item.id === itemId);
    if (!selectedItem) return;

    setConfigs((current) =>
      current.map((config, index) =>
        index === activeConfigIndex
          ? {
              ...config,
              [selectedPartKey]: selectedItem,
            }
          : config,
      ),
    );
    closePartModal();
  };

  const clearActiveConfig = () => {
    setConfigs((current) => current.map((config, index) => (index === activeConfigIndex ? {} : config)));
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand],
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedSeries(ALL_SERIES_LABEL);
    setSelectedMinRating(0);
    setSelectedPriceRange(ALL_PRICE_RANGE);
  };

  const deletePartFromConfig = (partKey: PartKey) => {
    setConfigs((current) =>
      current.map((config, index) => {
        if (index !== activeConfigIndex) return config;

        const updated = { ...config };
        delete updated[partKey];
        return updated;
      }),
    );
  };

  const addProductToCart = async (product: { id: string; price: number }) => {
    const currentCart = await getCart().catch(() => null);
    const inCart = currentCart?.items.find((item) => item.productId === product.id)?.quantity ?? 0;
    await updateCartItem(product.id, {
      quantity: inCart + 1,
      priceOverride: product.price,
    });
  };

  const handleAddSuggestedBuildToCart = async (build: SuggestedBuild) => {
    if (addingProductId) return;

    setAddingProductId(build.id);
    try {
      await addProductToCart({ id: build.id, price: build.price });
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thêm sản phẩm vào giỏ hàng'));
    } finally {
      setAddingProductId(null);
    }
  };

  const handleAddActiveConfigToCart = async () => {
    const selectedItems = Object.values(activeConfig).filter((item): item is CatalogItem => Boolean(item));
    if (selectedItems.length === 0 || isAddingConfigToCart) return;

    setIsAddingConfigToCart(true);
    try {
      const currentCart = await getCart().catch(() => null);
      const quantities = new Map(currentCart?.items.map((item) => [item.productId, item.quantity]) ?? []);

      for (const item of selectedItems) {
        const nextQuantity = (quantities.get(item.id) ?? 0) + 1;
        await updateCartItem(item.id, {
          quantity: nextQuantity,
          priceOverride: item.price,
        });
        quantities.set(item.id, nextQuantity);
      }

      toast.success(`Đã thêm ${selectedItems.length} linh kiện vào giỏ hàng`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thêm cấu hình vào giỏ hàng'));
    } finally {
      setIsAddingConfigToCart(false);
    }
  };

  const handleConsultActiveConfig = () => {
    const selectedItems = buildParts
      .map((part) => {
        const item = activeConfig[part.key];
        return item ? `${part.shortLabel}: ${item.name} (${formatCurrency(item.price)})` : null;
      })
      .filter(Boolean);

    if (selectedItems.length === 0) return;

    window.dispatchEvent(
      new CustomEvent(PRODUCT_CONSULT_CHAT_EVENT, {
        detail: {
          initialMessage: `Tư vấn giúp mình cấu hình PC này:\n${selectedItems.join('\n')}\nTổng: ${formatCurrency(total)}`,
        },
      }),
    );
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
          {suggestedBuildCategories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveSuggestedCategory(category.slug)}
              className={cn(
                'rounded-sm px-5 py-2 text-[13px] font-bold transition-colors',
                activeSuggestedCategory === category.slug
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-[#e8ecf1] text-on-surface-variant hover:bg-[#dce3eb]',
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        <SuggestedBuildGrid
          suggestedBuilds={suggestedBuilds}
          isLoading={isSuggestedBuildsLoading}
          dataError={dataError}
          addingProductId={addingProductId}
          onAddToCart={handleAddSuggestedBuildToCart}
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
                onDelete={() => deletePartFromConfig(part.key)}
              />
            ))}
          </div>
        </div>

        <BuildSummary
          buildParts={buildParts}
          activeConfig={activeConfig}
          selectedCount={selectedCount}
          total={total}
          isAddingToCart={isAddingConfigToCart}
          onConsult={handleConsultActiveConfig}
          onAddAllToCart={handleAddActiveConfigToCart}
        />
      </section>

      {selectedPart ? (
        <PartPickerModal
          selectedPart={selectedPart}
          filteredItems={filteredItems}
          pendingItemId={pendingItemId}
          selectedItem={selectedItemForModal}
          searchTerm={searchTerm}
          selectedBrands={selectedBrands}
          selectedSeries={selectedSeries}
          selectedMinRating={selectedMinRating}
          selectedPriceRange={selectedPriceRange}
          availableBrands={availableBrands}
          availableSeries={availableSeries}
          availableRatings={availableRatings}
          availablePriceRanges={availablePriceRanges}
          currentPage={modalPage}
          totalPages={totalPages}
          isLoading={isCatalogLoading}
          onClose={closePartModal}
          onSelectPendingItem={selectAndConfirm}
          onSearchTermChange={setSearchTerm}
          onToggleBrand={toggleBrand}
          onSeriesChange={setSelectedSeries}
          onMinRatingChange={setSelectedMinRating}
          onPriceRangeChange={setSelectedPriceRange}
          onResetFilters={resetFilters}
          onPageChange={setModalPage}
        />
      ) : null}
    </div>
  );
}
