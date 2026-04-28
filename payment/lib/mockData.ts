import { PaymentStatus, PaymentMethod } from '@/types/payment';
import type { Payment, PaymentStatsResponse, DailyRevenue } from '@/types/payment';
import type { PageResponse } from '@/types/api';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-001', orderId: 'ord-001', customerId: 'user-001', amount: 35480000, method: PaymentMethod.VNPAY, status: PaymentStatus.COMPLETED, transactionId: 'VNP-14256789', createdAt: daysAgo(5), completedAt: daysAgo(5) },
  { id: 'pay-002', orderId: 'ord-002', customerId: 'user-001', amount: 33020000, method: PaymentMethod.BANK_TRANSFER, status: PaymentStatus.COMPLETED, transactionId: 'BT-98765432', createdAt: daysAgo(3), completedAt: daysAgo(3) },
  { id: 'pay-003', orderId: 'ord-003', customerId: 'user-001', amount: 25990000, method: PaymentMethod.MOMO, status: PaymentStatus.PROCESSING, transactionId: 'MOMO-55667788', createdAt: daysAgo(1) },
  { id: 'pay-004', orderId: 'ord-004', customerId: 'user-001', amount: 24480000, method: PaymentMethod.COD, status: PaymentStatus.PENDING, transactionId: 'COD-99887766', createdAt: daysAgo(0) },
  { id: 'pay-005', orderId: 'ord-005', customerId: 'user-001', amount: 40990000, method: PaymentMethod.CREDIT_CARD, status: PaymentStatus.CANCELLED, transactionId: 'CC-11223344', createdAt: daysAgo(8) },
  { id: 'pay-006', orderId: 'ord-006', customerId: 'user-001', amount: 10990000, method: PaymentMethod.VNPAY, status: PaymentStatus.COMPLETED, transactionId: 'VNP-44556677', createdAt: daysAgo(6), completedAt: daysAgo(6) },
  { id: 'pay-007', orderId: 'ord-007', customerId: 'user-001', amount: 15490000, method: PaymentMethod.MOMO, status: PaymentStatus.FAILED, transactionId: 'MOMO-12309876', createdAt: daysAgo(4), failureReason: 'Số dư không đủ' },
  { id: 'pay-008', orderId: 'ord-008', customerId: 'user-001', amount: 7990000, method: PaymentMethod.VNPAY, status: PaymentStatus.REFUNDED, transactionId: 'VNP-78901234', createdAt: daysAgo(10), completedAt: daysAgo(9) },
];

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

export function getMockPaymentById(id: string): Payment | undefined {
  return MOCK_PAYMENTS.find((p) => p.id === id);
}

export function getMockPaymentByOrderId(orderId: string): Payment | undefined {
  return MOCK_PAYMENTS.find((p) => p.orderId === orderId);
}

export function getMockPaymentStats(): PaymentStatsResponse {
  const completed = MOCK_PAYMENTS.filter((p) => p.status === PaymentStatus.COMPLETED);
  const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);

  const byStatus: Record<string, number> = {};
  const byMethod: Record<string, number> = {};
  MOCK_PAYMENTS.forEach((p) => {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    byMethod[p.method] = (byMethod[p.method] || 0) + 1;
  });

  const dailyRevenue: DailyRevenue[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const dateStr = date.toISOString().split('T')[0];
    const dayPayments = completed.filter((p) => p.createdAt.startsWith(dateStr));
    dailyRevenue.push({
      date: dateStr,
      count: dayPayments.length,
      revenue: dayPayments.reduce((s, p) => s + p.amount, 0),
    });
  }

  return {
    totalPayments: MOCK_PAYMENTS.length,
    totalRevenue,
    byStatus,
    byMethod,
    dailyRevenue,
  };
}
