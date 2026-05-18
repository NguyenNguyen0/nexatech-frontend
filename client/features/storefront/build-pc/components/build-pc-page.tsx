'use client';

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { cn, formatCurrency } from '@/lib/utils';

type PartKey = 'cpu' | 'mainboard' | 'ram' | 'hdd' | 'ssd' | 'gpu' | 'psu';

type BuildPart = {
  key: PartKey;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
};

type CatalogItem = {
  id: string;
  partKey: PartKey;
  name: string;
  brand: string;
  series: string;
  compatibility: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  image?: string;
};

type SuggestedBuild = {
  id: string;
  name: string;
  specs: string[];
  price: number;
  originalPrice: number;
  discountLabel: string;
  savingsLabel: string;
  image: string;
};

type BuildSelection = Partial<Record<PartKey, CatalogItem>>;

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

const suggestedBuilds: SuggestedBuild[] = [
  {
    id: 'cupid',
    name: 'PC PV Gaming Cupid TM028 (i5-13400F / RTX 4060)',
    specs: ['i5-13400F', 'RTX 4060', '16GB RAM'],
    price: 18_990_000,
    originalPrice: 21_390_000,
    discountLabel: '-12%',
    savingsLabel: 'Tiết kiệm 2.400.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGQ8EsLo3-3nQVxFLag93TPGaEG5fA2LgaTIPaOPX0HocMrJXriR-9Jj41uoTuV_QxrtBnQH9SkY9tCb3gWDMv1zD63Hwy-YV0VyfMe8A4AcMvYYpHZYWtn5sMKTNxPJEnMy8LqgQe16I2ceb2XjPGac6wNz9fzr9is2Ta6Zh-RucCb-QOqaBZvDw7ewGIEuMF-CYulME4hphXo_QSlWb6w8YqAvGL078HwFcdfc4_vfkqftAEpEo5DxQ1U_mh7lPZ4DI5IvCJoA',
  },
  {
    id: 'zeus',
    name: 'PC PV Gaming Zeus TM015 (i7-14700K / RTX 4070)',
    specs: ['i7-14700K', 'RTX 4070', '32GB RAM'],
    price: 35_490_000,
    originalPrice: 38_990_000,
    discountLabel: '-8%',
    savingsLabel: 'Tiết kiệm 1.500.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA4-nT7rFPH-l3epBhtrU9FgpUPYjxwJ2tS8Mm-7mZPMcOAQW1b47UkFOGnO89aMeazrZFI_UjUGPD-FsGS0DmgYtF7BPHsO1b_cBvZnWkn_hK0e9813MX17OY6ubb4Wfa5f3_NtWAtZJFK-yjf1ug6cLS9dwzyq7ZE6QizIbBu_nzOpvQtBMv_c8yobnwC1C0DvBFmE_eVtuTaYJz-xjkBD9yBB5sQWYgzFI4yw3I_pMxMhKsc91PZsflkelutt2OGSYIzO75c0w',
  },
  {
    id: 'orion',
    name: 'PC PV Gaming Orion TM042 (i3-13100 / GTX 1650)',
    specs: ['i3-13100', 'GTX 1650', '16GB RAM'],
    price: 12_290_000,
    originalPrice: 14_490_000,
    discountLabel: '-15%',
    savingsLabel: 'Tiết kiệm 800.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCViAzhdcW48_ElbsaK4Q_6EpwWduU_U3egE24n0qujRe_kZdnNz-V-nv0YpQlO7DdaKpVgJGU2yBTJ-bQR5-mI5JqIAWGzRy4XpDzPjNiiVGMweHV1pljyb9fsOuauoyXRE_AjoZ49pr2ugJoAvgxJ9DAwLS7ugCU6xhWn0TagE_wB_dPHRGX8d5PXsL0GrPI2wqq_pAm88P_kfmp1u0TYYWlLwTU8FoPW9z4vBd53_PVv9gQElm7XyHX2pGMXLBk7z_MAvMO4FQ',
  },
  {
    id: 'hydra',
    name: 'PC PV Gaming Hydra TM099 (i9-14900K / RTX 4090)',
    specs: ['i9-14900K', 'RTX 4090', '64GB RAM'],
    price: 89_990_000,
    originalPrice: 94_190_000,
    discountLabel: '-5%',
    savingsLabel: 'Tiết kiệm 4.200.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAzDqhD0uCyBwYv_b8dSOLDMjaaISK8JY143sNclTL3v_taGEx-3ZbIXnpiN4eFVrMsihFY2b98BFGyS1rE2ZFim12z7jFXGlLNeRrqIBuoggmMkvp7BP43ZELTcK6_Lun-7AfDT1O80aNWWjtTVDoIJtLu9AF2etNT_dVH2rUkTrKAsdnVkQzER6PWYZIhI4y2OJ42VqVSSavZh1QyDdifSgeNWhtgLQ8jDVus_k-AZ98rpf_nrirdOnpS7-1lPioT5YVkpslR6g',
  },
  {
    id: 'atlas',
    name: 'PC PV Gaming Atlas TM031 (Ryzen 7 7800X3D / RTX 4070 Ti)',
    specs: ['R7-7800X3D', 'RTX 4070 Ti', '32GB RAM'],
    price: 45_890_000,
    originalPrice: 49_990_000,
    discountLabel: '-10%',
    savingsLabel: 'Tiết kiệm 2.100.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAb09T7cemhqurk1D8jHYomUC53qfsqhc_BG9s9eGqWK44S_NSEuVJc5OlRL5iw231zCwSOYI_nL7RF8nZ6manfaNNybxP_OOlzKi5cRF0SFctCfhxe6esPlMHutgvxE-YV6QeC-0NWcMPfp8tCAWntSjy4cYEZBnaqHPGewUNWYbrqN1Vg3UHE8cejCYQd3g_1TIrzDmq9IrBIq_K4oMSuuA07orQGNfTtYjefeCnzE7AQl7Szm2ktTtcFVPs1OAVIZeRIL6-lCA',
  },
];

const catalog: CatalogItem[] = [
  {
    id: 'cpu-intel-i9',
    partKey: 'cpu',
    name: 'Intel Core i9-14900K (up to 6.0GHz, 24 nhân 32 luồng)',
    brand: 'Intel',
    series: 'Core i9',
    compatibility: 'LGA 1700',
    price: 15_490_000,
    originalPrice: 16_990_000,
    badge: 'Trả góp 0%',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDzIGc7y82yXiY9pyeBVEeV2arYHRIChpG53DC8FIYF4qUWo0h0CYaPlDARb_uiyg7KpA0poSvyVSNIzESUi_QeMHInh8UkbvoVobubfyHV12nfQi4S84fnq1eRIKa9mO9navKH2EwoW3rsT6sVK9piYv3jGBMgLX1nnjugFf9iKyl8JwY5pzPjaxo6BIXegYj3yFVTTPz42QUW3oMfVXwx_OZ0ZetZzM-i1ACDGFbtKwLaBjqEnr-3EoSPg-bO248AwBS51hDAYg',
  },
  {
    id: 'cpu-amd-r9',
    partKey: 'cpu',
    name: 'AMD Ryzen 9 7950X (up to 5.7GHz, 16 nhân 32 luồng)',
    brand: 'AMD',
    series: 'Ryzen 9',
    compatibility: 'AM5',
    price: 14_250_000,
    originalPrice: 15_500_000,
    badge: 'Hot',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCx4n9UDcSJovpGvtTkdAHdQ_zE5hmh_zHQLfUaajlOO7LaFD9kZ_A4_KRq4s1EoU-aqmp0nWxUuif7aENmVCkEwg6ppEZ5NTu8R6B3gqlI5zQGakwPgJVpHo1cJENCM3RzZJGqnErUmmawBI_DT3ER1cLVZwNc7uOLeRu9RckW1KRyfBSETpINkZUoHq-Dt_AXRoEumiIlLj8Jbb4WojsYECpjSc_Y7pAT4yldhyephfII1lj0U4m9-ep4OGoOqtOJ8OQwTgNdZg',
  },
  {
    id: 'cpu-intel-i7',
    partKey: 'cpu',
    name: 'Intel Core i7-14700K (up to 5.6GHz, 20 nhân 28 luồng)',
    brand: 'Intel',
    series: 'Core i7',
    compatibility: 'LGA 1700',
    price: 11_190_000,
    originalPrice: 12_290_000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCVNu0rMXbtc-MVkFyJk8KSqkCc7RVjDplgg3usfRKc2MV0ImgOf1znz5pAbaFHybqrb0hKNZWia3pRY5fQSO8WHMcwfwEDly8gIuv94kStwaDDqyStb9RS2vVIoExsTzDnfPZvIqeI8p1-nj5sTzd6E3SGPMjPJUrYRz-0Uhthd_4FSt_jkBth9Xl0qwyQbwY2_w3ULX9FLwVl4CC1N7s2GRUNK12o7GufoQnzg8jTdBpyP8s-7CiWGInoi0jy1ve1FdV7x9EdMg',
  },
  {
    id: 'cpu-amd-r7',
    partKey: 'cpu',
    name: 'AMD Ryzen 7 7800X3D (up to 5.0GHz, 8 nhân 16 luồng)',
    brand: 'AMD',
    series: 'Ryzen 7',
    compatibility: 'AM5',
    price: 10_890_000,
    originalPrice: 11_900_000,
    badge: 'Bán chạy',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmQ0AeHyC10FiNbP_ut1mPFOH8WV8emrCj1Wq1ZKEUZJQZfnCBA7AYbaefttSEBAGTgVldAMIqUEBItSUra5jQl9U_6BfI0NYxKkfdrperA4F0dE9tcO_vhKZkHKxAZVM-8Wg6qOA7sf67Opb-L6xcaIcsnYuAIoRB7hxDEYw7VHCAaIJtCjxEDslurJBtX08KtGZGLUb39QueSQ7oz-NIO763qUJs7e2tbEQLy4RJd8eSCNCn0ORUXSyMZEkR1u1YJc45mQkQRQ',
  },
  {
    id: 'mb-asus-z790',
    partKey: 'mainboard',
    name: 'ASUS ROG Strix Z790-F Gaming WiFi II',
    brand: 'ASUS',
    series: 'Z790',
    compatibility: 'LGA 1700',
    price: 10_990_000,
    originalPrice: 11_690_000,
    badge: 'Mới',
  },
  {
    id: 'mb-msi-b650',
    partKey: 'mainboard',
    name: 'MSI MAG B650 Tomahawk WiFi',
    brand: 'MSI',
    series: 'B650',
    compatibility: 'AM5',
    price: 5_790_000,
    originalPrice: 6_190_000,
  },
  {
    id: 'ram-corsair-32',
    partKey: 'ram',
    name: 'Corsair Vengeance RGB DDR5 32GB 6000MHz',
    brand: 'Corsair',
    series: 'DDR5',
    compatibility: '32GB',
    price: 3_690_000,
    originalPrice: 4_090_000,
    badge: 'Hot',
  },
  {
    id: 'ram-kingston-16',
    partKey: 'ram',
    name: 'Kingston Fury Beast DDR5 16GB 5600MHz',
    brand: 'Kingston',
    series: 'DDR5',
    compatibility: '16GB',
    price: 1_890_000,
  },
  {
    id: 'hdd-wd-2tb',
    partKey: 'hdd',
    name: 'WD Blue 2TB 7200RPM',
    brand: 'Western Digital',
    series: 'HDD',
    compatibility: '2TB',
    price: 1_490_000,
  },
  {
    id: 'hdd-seagate-4tb',
    partKey: 'hdd',
    name: 'Seagate Barracuda 4TB 5400RPM',
    brand: 'Seagate',
    series: 'HDD',
    compatibility: '4TB',
    price: 2_390_000,
  },
  {
    id: 'ssd-samsung-1tb',
    partKey: 'ssd',
    name: 'Samsung 990 EVO Plus 1TB NVMe',
    brand: 'Samsung',
    series: 'NVMe',
    compatibility: '1TB',
    price: 2_790_000,
    originalPrice: 3_090_000,
  },
  {
    id: 'ssd-kingston-1tb',
    partKey: 'ssd',
    name: 'Kingston NV3 1TB PCIe 4.0',
    brand: 'Kingston',
    series: 'NVMe',
    compatibility: '1TB',
    price: 1_790_000,
  },
  {
    id: 'gpu-msi-4070',
    partKey: 'gpu',
    name: 'MSI GeForce RTX 4070 SUPER 12GB Ventus 2X',
    brand: 'MSI',
    series: 'RTX 4070',
    compatibility: '12GB',
    price: 18_990_000,
    originalPrice: 20_490_000,
    badge: 'Hot',
  },
  {
    id: 'gpu-gigabyte-4060',
    partKey: 'gpu',
    name: 'Gigabyte GeForce RTX 4060 Eagle OC 8GB',
    brand: 'Gigabyte',
    series: 'RTX 4060',
    compatibility: '8GB',
    price: 8_990_000,
  },
  {
    id: 'psu-corsair-850',
    partKey: 'psu',
    name: 'Corsair RM850e 850W 80 Plus Gold',
    brand: 'Corsair',
    series: 'Gold',
    compatibility: '850W',
    price: 3_290_000,
    originalPrice: 3_590_000,
  },
  {
    id: 'psu-cooler-750',
    partKey: 'psu',
    name: 'Cooler Master MWE Gold 750 V2',
    brand: 'Cooler Master',
    series: 'Gold',
    compatibility: '750W',
    price: 2_390_000,
  },
];

const presetLabels = ['Cấu hình 1', 'Cấu hình 2', 'Cấu hình 3'];

export function BuildPcPage() {
  const [activeConfigIndex, setActiveConfigIndex] = useState(0);
  const [configs, setConfigs] = useState<BuildSelection[]>([{}, {}, {}]);
  const [selectedPartKey, setSelectedPartKey] = useState<PartKey | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState('Tất cả');
  const [selectedCompatibility, setSelectedCompatibility] = useState('Tất cả');

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
          {suggestedBuilds.map((build) => (
            <article
              key={build.id}
              className="group relative flex h-full flex-col rounded-md border border-[#e8e8e8] bg-white p-2.5 transition-all hover:shadow-md"
            >
              <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-[#e30019] px-1.5 py-[1px] text-[10px] font-bold text-white">
                {build.savingsLabel}
              </span>
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
          ))}
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
