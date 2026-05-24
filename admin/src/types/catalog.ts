import type { PageResponse } from '@/types/api-envelope'

export type ProductStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export interface ProductItem {
  id: string
  name: string
  slug: string
  description?: string
  descriptionHtml?: string
  price: number
  compareAtPrice?: number
  sku?: string
  thumbnail?: string
  primaryCategoryId?: string
  primaryCategorySlug?: string
  primaryCategoryName?: string
  categoryIds?: string[]
  categorySlugs?: string[]
  brandId?: string
  brandName?: string
  brandSlug?: string
  images?: string[]
  specs?: Record<string, string>
  tags?: string[]
  metadata?: Record<string, unknown>
  active: boolean
  averageRating?: number
  stockQuantity?: number
  stockStatus?: ProductStockStatus
  createdAt?: string
  updatedAt?: string
}

export interface ProductUpsertPayload {
  name: string
  description?: string
  descriptionHtml?: string
  price: number
  compareAtPrice?: number
  sku?: string
  thumbnail?: string
  primaryCategoryId?: string
  primaryCategorySlug?: string
  categoryIds?: string[]
  categorySlugs?: string[]
  brandId?: string
  images?: string[]
  specs?: Record<string, string>
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface ProductListParams {
  keyword?: string
  categoryId?: string
  categorySlug?: string
  brandId?: string
  sku?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  maxRating?: number
  featured?: boolean
  active?: boolean
  includeDeleted?: boolean
  page?: number
  size?: number
  sort?: string | string[]
  specs?: Record<string, string>
}

export interface ProductImageDeletePayload {
  imageUrl: string
}

export interface ProductImageReorderPayload {
  imageUrls: string[]
}

export interface CategoryItem {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string | null
  sortOrder?: number
  active: boolean
  filter?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface CategoryUpsertPayload {
  name: string
  description?: string
  parentId?: string | null
  sortOrder?: number
  filter?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface CategoryListParams {
  active?: boolean
  includeDeleted?: boolean
}

export interface BrandItem {
  id: string
  name: string
  slug: string
  parentBrandId?: string | null
  logoUrl?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BrandUpsertPayload {
  name: string
  parentBrandId?: string | null
  logoUrl?: string
}

export interface BrandListParams {
  active?: boolean
  includeDeleted?: boolean
}

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export interface InventoryItem {
  id: string
  productId: string
  productName: string
  productSlug?: string
  productThumbnail?: string
  sku: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderLevel: number
  status: InventoryStatus
  warehouseLocation?: string
}

export interface InventoryListParams {
  sku?: string
  status?: InventoryStatus
  keyword?: string
  warehouseLocation?: string
  page?: number
  size?: number
  sort?: string | string[]
}

export interface InventoryUpsertPayload {
  productId: string
  sku?: string
  quantity: number
  reason?: string
}

export interface InventoryWarehousePatchPayload {
  warehouseLocation?: string
  reorderLevel?: number
}

export type MovementType = 'ADJUSTMENT' | 'INBOUND' | 'OUTBOUND' | 'RESERVED' | 'RELEASED'

export interface InventoryMovementItem {
  id: string
  productId: string
  type: MovementType | string
  quantity: number
  reference?: string
  reason?: string
  performedBy?: string | null
  createdAt: string
}

export interface InventoryMovementListParams {
  page?: number
  size?: number
  sort?: string | string[]
}

export interface InventoryBulkImportItem {
  productId: string
  sku?: string
  quantity: number
  reason?: string
}

export interface InventoryBulkImportResponse {
  successCount: number
  failureCount: number
  errors: string[]
}

export interface CsvImportErrorLine {
  lineNumber: number
  sku?: string
  reason: string
}

export interface InventoryCsvImportResponse {
  successCount: number
  failureCount: number
  totalLines: number
  errorLines: CsvImportErrorLine[]
}

export type ProductPageResponse = PageResponse<ProductItem>
export type InventoryPageResponse = PageResponse<InventoryItem>
export type InventoryMovementPageResponse = PageResponse<InventoryMovementItem>
