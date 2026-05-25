export type PromotionType = 'FLASH_SALE' | 'COUPON' | 'PERCENTAGE' | 'FIXED_AMOUNT';

export type PromotionStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'CANCELLED';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'RELEASED' | 'EXPIRED';

export interface FlashSaleResponse {
  id: string;
  promotionId: string;
  productId: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  totalStock: number;
  remainingStock: number;
  soldCount: number;
  soldPercent: number;
  startTime: string;
  endTime: string;
  status: PromotionStatus;
  promotion: {
    code: string;
    name: string;
    description?: string;
  };
}

export interface FlashSaleListResponse {
  items: FlashSaleResponse[];
  total: number;
  page: number;
  size: number;
}

export interface PromotionResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userLimit: number;
  startTime: string;
  endTime: string;
  status: PromotionStatus;
}

export interface CouponValidateRequest {
  code: string;
  orderAmount: number;
}

export interface CouponValidateResponse {
  valid: boolean;
  promotionId: string;
  promotionCode: string;
  discountAmount: number;
  message?: string;
}

export interface FlashSaleReservationResponse {
  id: string;
  flashSaleId: string;
  userId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  ttlSeconds: number;
}

export interface PromotionApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PromotionApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}
