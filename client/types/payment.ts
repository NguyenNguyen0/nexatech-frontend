/**
 * Types mirroring payment-service backend DTOs.
 * ApiResponse format: { success: boolean, data: T, message?: string, timestamp: string }
 */

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type PaymentMethodType =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'MOMO'
  | 'VNPAY'
  | 'CREDIT_CARD';

/** Wrapper response từ payment-service (khác với identity/order service). */
export interface PaymentApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaymentPageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethodType;
  status: PaymentStatus;
  transactionId?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}
