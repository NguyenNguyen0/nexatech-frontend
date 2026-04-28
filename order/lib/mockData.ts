import { OrderStatus, PaymentMethod } from '@/types/order';
import type { Order, PageResponse } from '@/types/order';
import { PaymentStatus } from '@/types/payment';
import type { Payment } from '@/types/payment';

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  soldCount: number;
  inStock: boolean;
}

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

export const MOCK_PRODUCTS: MockProduct[] = [
  { id: 'p-001', name: 'iPhone 15 Pro Max 256GB', slug: 'iphone-15-pro-max', price: 29990000, originalPrice: 34990000, image: '/mock/iphone15.jpg', category: 'Điện thoại', brand: 'Apple', rating: 4.9, soldCount: 1240, inStock: true },
  { id: 'p-002', name: 'MacBook Air M3 15 inch', slug: 'macbook-air-m3-15', price: 32990000, originalPrice: 37990000, image: '/mock/macbook.jpg', category: 'Laptop', brand: 'Apple', rating: 4.8, soldCount: 560, inStock: true },
  { id: 'p-003', name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-s24-ultra', price: 25990000, originalPrice: 31990000, image: '/mock/s24ultra.jpg', category: 'Điện thoại', brand: 'Samsung', rating: 4.7, soldCount: 890, inStock: true },
  { id: 'p-004', name: 'AirPods Pro 2 USB-C', slug: 'airpods-pro-2', price: 5490000, originalPrice: 6790000, image: '/mock/airpods.jpg', category: 'Phụ kiện', brand: 'Apple', rating: 4.8, soldCount: 3200, inStock: true },
  { id: 'p-005', name: 'iPad Air M2 11 inch', slug: 'ipad-air-m2', price: 16990000, originalPrice: 19990000, image: '/mock/ipad.jpg', category: 'Tablet', brand: 'Apple', rating: 4.6, soldCount: 420, inStock: true },
  { id: 'p-006', name: 'Sony WH-1000XM5', slug: 'sony-wh1000xm5', price: 7490000, originalPrice: 8990000, image: '/mock/sony-xm5.jpg', category: 'Phụ kiện', brand: 'Sony', rating: 4.7, soldCount: 780, inStock: true },
  { id: 'p-007', name: 'Dell XPS 15 9530', slug: 'dell-xps-15', price: 42990000, originalPrice: 49990000, image: '/mock/dell-xps.jpg', category: 'Laptop', brand: 'Dell', rating: 4.5, soldCount: 210, inStock: true },
  { id: 'p-008', name: 'Apple Watch Series 9', slug: 'apple-watch-s9', price: 10990000, originalPrice: 12990000, image: '/mock/watch.jpg', category: 'Đồng hồ', brand: 'Apple', rating: 4.6, soldCount: 650, inStock: false },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001', orderNumber: 'NXT-20260425-001', customerId: 'user-001',
    status: OrderStatus.DELIVERED, totalAmount: 35480000, shippingFee: 0, discount: 500000,
    shippingAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM', shippingMethod: 'EXPRESS',
    paymentMethod: PaymentMethod.VNPAY, trackingNumber: 'VN123456789',
    carrierName: 'Giao Hàng Nhanh', deliveredAt: daysAgo(2),
    items: [
      { id: 'oi-001', productId: 'p-001', productName: 'iPhone 15 Pro Max 256GB', unitPrice: 29990000, quantity: 1, subtotal: 29990000 },
      { id: 'oi-002', productId: 'p-004', productName: 'AirPods Pro 2 USB-C', unitPrice: 5490000, quantity: 1, subtotal: 5490000 },
    ],
    createdAt: daysAgo(5), updatedAt: daysAgo(2),
  },
  {
    id: 'ord-002', orderNumber: 'NXT-20260426-002', customerId: 'user-001',
    status: OrderStatus.SHIPPED, totalAmount: 32990000, shippingFee: 30000, discount: 0,
    shippingAddress: '456 Lê Lợi, Quận 3, TP.HCM', shippingMethod: 'STANDARD',
    paymentMethod: PaymentMethod.BANK_TRANSFER, trackingNumber: 'VN987654321',
    carrierName: 'Viettel Post', shippedAt: daysAgo(1),
    estimatedDelivery: new Date(now.getTime() + 2 * 86400000).toISOString(),
    items: [
      { id: 'oi-003', productId: 'p-002', productName: 'MacBook Air M3 15 inch', unitPrice: 32990000, quantity: 1, subtotal: 32990000 },
    ],
    createdAt: daysAgo(3), updatedAt: daysAgo(1),
  },
  {
    id: 'ord-003', orderNumber: 'NXT-20260427-003', customerId: 'user-001',
    status: OrderStatus.PROCESSING, totalAmount: 25990000, shippingFee: 0, discount: 0,
    shippingAddress: '789 Trần Hưng Đạo, Quận 5, TP.HCM', shippingMethod: 'EXPRESS',
    paymentMethod: PaymentMethod.MOMO,
    items: [
      { id: 'oi-004', productId: 'p-003', productName: 'Samsung Galaxy S24 Ultra', unitPrice: 25990000, quantity: 1, subtotal: 25990000 },
    ],
    createdAt: daysAgo(1), updatedAt: hoursAgo(6),
  },
  {
    id: 'ord-004', orderNumber: 'NXT-20260427-004', customerId: 'user-001',
    status: OrderStatus.PENDING, totalAmount: 24480000, shippingFee: 0, discount: 0,
    shippingAddress: '101 Võ Văn Tần, Quận 3, TP.HCM', shippingMethod: 'STANDARD',
    paymentMethod: PaymentMethod.COD,
    items: [
      { id: 'oi-005', productId: 'p-005', productName: 'iPad Air M2 11 inch', unitPrice: 16990000, quantity: 1, subtotal: 16990000 },
      { id: 'oi-006', productId: 'p-006', productName: 'Sony WH-1000XM5', unitPrice: 7490000, quantity: 1, subtotal: 7490000 },
    ],
    createdAt: hoursAgo(3), updatedAt: hoursAgo(3),
  },
  {
    id: 'ord-005', orderNumber: 'NXT-20260420-005', customerId: 'user-001',
    status: OrderStatus.CANCELLED, totalAmount: 42990000, shippingFee: 0, discount: 2000000,
    shippingAddress: '202 Hai Bà Trưng, Quận 1, TP.HCM', shippingMethod: 'EXPRESS',
    paymentMethod: PaymentMethod.CREDIT_CARD, note: 'Đổi ý, không cần nữa',
    items: [
      { id: 'oi-007', productId: 'p-007', productName: 'Dell XPS 15 9530', unitPrice: 42990000, quantity: 1, subtotal: 42990000 },
    ],
    createdAt: daysAgo(8), updatedAt: daysAgo(7),
  },
  {
    id: 'ord-006', orderNumber: 'NXT-20260422-006', customerId: 'user-001',
    status: OrderStatus.COMPLETED, totalAmount: 10990000, shippingFee: 0, discount: 0,
    shippingAddress: '55 Pasteur, Quận 1, TP.HCM', shippingMethod: 'EXPRESS',
    paymentMethod: PaymentMethod.VNPAY, deliveredAt: daysAgo(4),
    items: [
      { id: 'oi-008', productId: 'p-008', productName: 'Apple Watch Series 9', unitPrice: 10990000, quantity: 1, subtotal: 10990000 },
    ],
    createdAt: daysAgo(6), updatedAt: daysAgo(4),
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-001', orderId: 'ord-001', customerId: 'user-001', amount: 35480000, method: PaymentMethod.VNPAY as unknown as import('@/types/payment').PaymentMethod, status: PaymentStatus.COMPLETED, transactionId: 'VNP-14256789', createdAt: daysAgo(5) },
  { id: 'pay-002', orderId: 'ord-002', customerId: 'user-001', amount: 33020000, method: PaymentMethod.BANK_TRANSFER as unknown as import('@/types/payment').PaymentMethod, status: PaymentStatus.COMPLETED, transactionId: 'BT-98765432', createdAt: daysAgo(3) },
  { id: 'pay-003', orderId: 'ord-003', customerId: 'user-001', amount: 25990000, method: PaymentMethod.MOMO as unknown as import('@/types/payment').PaymentMethod, status: PaymentStatus.PROCESSING, transactionId: 'MOMO-55667788', createdAt: daysAgo(1) },
  { id: 'pay-004', orderId: 'ord-005', customerId: 'user-001', amount: 40990000, method: PaymentMethod.CREDIT_CARD as unknown as import('@/types/payment').PaymentMethod, status: PaymentStatus.CANCELLED, transactionId: 'CC-11223344', createdAt: daysAgo(8) },
  { id: 'pay-005', orderId: 'ord-006', customerId: 'user-001', amount: 10990000, method: PaymentMethod.VNPAY as unknown as import('@/types/payment').PaymentMethod, status: PaymentStatus.COMPLETED, transactionId: 'VNP-44556677', createdAt: daysAgo(6) },
];

export function getMockOrders(page = 0, size = 10): PageResponse<Order> {
  const start = page * size;
  const content = MOCK_ORDERS.slice(start, start + size);
  return {
    content,
    totalElements: MOCK_ORDERS.length,
    totalPages: Math.ceil(MOCK_ORDERS.length / size),
    page,
    size,
    last: start + size >= MOCK_ORDERS.length,
  };
}

export function getMockOrderById(id: string): Order | undefined {
  return MOCK_ORDERS.find((o) => o.id === id);
}

export function getMockPayments(page = 0, size = 10, status?: PaymentStatus): PageResponse<Payment> {
  const filtered = status ? MOCK_PAYMENTS.filter((p) => p.status === status) : MOCK_PAYMENTS;
  const start = page * size;
  const content = filtered.slice(start, start + size);
  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
    last: start + size >= filtered.length,
  };
}

export function getMockPaymentByOrderId(orderId: string): Payment | undefined {
  return MOCK_PAYMENTS.find((p) => p.orderId === orderId);
}
