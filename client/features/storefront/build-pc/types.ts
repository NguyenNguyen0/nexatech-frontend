export type PartKey = 'cpu' | 'pc-case' | 'ram' | 'hdd' | 'ssd' | 'monitor' | 'power-supply-psu';

export type BuildPart = {
  key: PartKey;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
};

export type CatalogItem = {
  id: string;
  partKey: PartKey;
  name: string;
  slug: string;
  brand: string;
  series: string;
  compatibility: string;
  averageRating: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  image?: string;
};

export type SuggestedBuild = {
  id: string;
  slug: string;
  name: string;
  specs: string[];
  price: number;
  originalPrice: number;
  discountLabel: string;
  savingsLabel: string;
  image: string;
};

export type CatalogPageResult = {
  items: CatalogItem[];
  page: number;
  size: number;
  totalItems?: number;
  totalPages: number;
  hasNext?: boolean;
};

export type BuildSelection = Partial<Record<PartKey, CatalogItem>>;
