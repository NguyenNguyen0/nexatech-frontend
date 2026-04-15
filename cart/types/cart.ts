export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  customerId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
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
