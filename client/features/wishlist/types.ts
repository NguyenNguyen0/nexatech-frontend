export interface WishlistToggleResult {
  productId: string;
  wishlisted: boolean;
}

export interface WishlistProductItem {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  price: number;
  compareAtPrice?: number;
  originalPrice?: number;
  brandId?: string;
  brandName?: string;
  primaryCategoryId?: string;
  primaryCategoryName?: string;
  averageRating?: number;
  reviewCount?: number;
  stockStatus?: string;
}

export interface WishlistPageResult {
  content: WishlistProductItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface WishlistQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface LegacyWishlistItem {
  productId: string;
  name?: string;
  price?: number;
  thumbnail?: string;
  slug?: string;
  addedAt?: string;
}
