export type PartKey = 'cpu' | 'mainboard' | 'ram' | 'hdd' | 'ssd' | 'gpu' | 'psu';

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
  name: string;
  specs: string[];
  price: number;
  originalPrice: number;
  discountLabel: string;
  savingsLabel: string;
  image: string;
};

export type BuildSelection = Partial<Record<PartKey, CatalogItem>>;
