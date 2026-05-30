/**
 * Types mirroring order-service backend DTOs.
 * ApiResponse format: { code: number, result: T, message?: string }
 */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OUT_OF_STOCK'
  | 'SHIPPING_FAILED'
  | 'REFUND_PENDING'
  | 'RETURNED'
  | 'REFUNDED';

export type OrderPaymentMethod =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'MOMO'
  | 'VNPAY'
  | 'CREDIT_CARD';

export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

// ── Order ────────────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId: string | null;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  /** Địa chỉ giao hàng (plain string từ backend) */
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: OrderPaymentMethod;
  note?: string;
  items: OrderItemResponse[] | null;
  createdAt: string;
  // Thông tin người mua (guest)
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  // Thông tin vận chuyển — được cập nhật bởi OrderShippingEventConsumer
  trackingNumber?: string;
  carrierName?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  compensationReason?: string;
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountHolder?: string;
  refundInfoSubmittedAt?: string;
}

// ── Order-service ApiResponse wrapper ────────────────────────────────────────

/** Wrapper từ order-service: { success, data, message?, timestamp } */
export interface OrderApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutRequest {
  /** Địa chỉ dạng chuỗi, ví dụ: "123 Lê Lợi, P.Bến Nghé, Q.1, TP.HCM" */
  shippingAddress: string;
  shippingMethod?: string;
  paymentMethod: OrderPaymentMethod;
  note?: string;
  couponCode?: string;
  /** Thông tin người đặt hàng (bắt buộc cho khách vãng lai) */
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  /** Sản phẩm từ giỏ hàng frontend (localStorage). Bắt buộc khi không có Redis cart. */
  items?: Array<{ productId: string; productName?: string; quantity: number; unitPrice?: number }>;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  paymentId: string;
  paymentMethod: OrderPaymentMethod;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  /** Chỉ có khi paymentMethod = VNPAY — redirect người dùng đến URL này */
  paymentUrl?: string;
}

export interface ContinuePaymentResponse {
  orderId: string;
  orderNumber: string;
  paymentId: string;
  paymentMethod: OrderPaymentMethod;
  paymentUrl: string;
  expiresAt: string;
}

export interface RefundBankInfoRequest {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// ── Return ────────────────────────────────────────────────────────────────────

export interface ReturnItemRequest {
  productId: string;
  productName?: string;
  quantity: number;
  reason?: string;
}

export interface CreateReturnRequest {
  reason: string;
  items: ReturnItemRequest[];
}

export interface ReturnItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  itemReason?: string;
}

export interface ReturnResponse {
  id: string;
  orderId: string;
  customerId: string;
  reason: string;
  status: ReturnStatus;
  adminNote?: string;
  items: ReturnItemResponse[];
  createdAt: string;
  updatedAt: string;
}
