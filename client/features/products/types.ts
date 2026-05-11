export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | string;

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  price: number;
  compareAtPrice?: number;
  averageRating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  stockStatus?: StockStatus;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  featured?: boolean;
}

export interface ProductDetail extends ProductSummary {
  description?: string;
  descriptionHtml?: string;
  images?: string[];
  specs?: Record<string, string | number | boolean | null | undefined>;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug?: string;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  price: number;
  compareAtPrice?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  userName?: string;
  avatar?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  helpfulCount: number;
  createdAt?: string;
  updatedAt?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  isHelpfulByMe?: boolean;
}

export interface ReviewWriteBody {
  rating: number;
  title: string;
  content: string;
  images: string[];
}

export type ReviewUpdateBody = ReviewWriteBody;

export interface ProductListParams {
  page?: number;
  size?: number;
  sort?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  featured?: boolean;
  keyword?: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  raw?: unknown;
}
