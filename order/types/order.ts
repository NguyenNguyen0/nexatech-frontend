export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
  CREDIT_CARD = 'CREDIT_CARD',
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  note?: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  [OrderStatus.PENDING]: { label: 'Chờ xác nhận', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  [OrderStatus.CONFIRMED]: { label: 'Đã xác nhận', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  [OrderStatus.PROCESSING]: { label: 'Đang xử lý', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
  [OrderStatus.SHIPPED]: { label: 'Đang giao', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  [OrderStatus.DELIVERED]: { label: 'Đã giao', color: 'text-green-700', bgColor: 'bg-green-50' },
  [OrderStatus.CANCELLED]: { label: 'Đã hủy', color: 'text-red-700', bgColor: 'bg-red-50' },
  [OrderStatus.REFUNDED]: { label: 'Hoàn tiền', color: 'text-gray-700', bgColor: 'bg-gray-50' },
};
