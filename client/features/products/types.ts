export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | string;

export interface ProductMinimal {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  thumbnail?: string;
  tags?: string[];
  price: number;
  compareAtPrice?: number;
  originalPrice?: number;
  averageRating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  stockStatus?: StockStatus;
  // Primary category (new backend structure)
  primaryCategoryId?: string;
  primaryCategorySlug?: string;
  primaryCategoryName?: string;
  // All categories this product belongs to (new multi-category support)
  categoryIds?: string[];
  categorySlugs?: string[];
  brandId?: string;
  brandName?: string;
  brandSlug?: string;
  featured?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductSummary = ProductMinimal;

export interface ProductDetail extends ProductMinimal {
  description?: string;
  descriptionHtml?: string;
  images?: string[];
  specs?: Record<string, string | number | boolean | null | undefined>;
}

export interface ProductCategoryMetadata {
  seoTitle?: string;
  seoDescription?: string;
  bannerImage?: string;
  [key: string]: unknown;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
  description?: string;
  metadata?: ProductCategoryMetadata;
  sortOrder?: number;
  children?: ProductCategory[];
}

export interface ProductSubcategory {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  children?: ProductSubcategory[];
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
  categoryIds?: string[];
  brandId?: string;
}

export interface RecommendationProductPayload {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail?: string;
  brandName?: string;
  primaryCategoryName?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface RecommendationItem {
  productId: string;
  score: number;
  product?: RecommendationProductPayload | null;
}

export interface RecommendationResponse {
  userId?: string;
  topK?: number;
  source?: string;
  recommendations: RecommendationItem[];
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
  rating?: number;
  tags?: string[];
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
