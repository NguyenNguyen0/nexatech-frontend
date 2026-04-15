export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CheckoutRequest {
  shippingAddress: string;
  shippingMethod?: string;
  paymentMethod: PaymentMethod;
  note?: string;
  couponCode?: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  paymentId?: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  paymentUrl?: string;
}

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
  CREDIT_CARD = 'CREDIT_CARD',
}
