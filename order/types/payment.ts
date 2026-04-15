export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
  CREDIT_CARD = 'CREDIT_CARD',
}

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
}

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bgColor: string }
> = {
  [PaymentStatus.PENDING]: { label: 'Chờ thanh toán', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  [PaymentStatus.COMPLETED]: { label: 'Đã thanh toán', color: 'text-green-700', bgColor: 'bg-green-50' },
  [PaymentStatus.FAILED]: { label: 'Thất bại', color: 'text-red-700', bgColor: 'bg-red-50' },
  [PaymentStatus.REFUNDED]: { label: 'Hoàn tiền', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
  [PaymentStatus.CANCELLED]: { label: 'Đã hủy', color: 'text-gray-700', bgColor: 'bg-gray-50' },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  VNPAY: 'VNPay',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  MOMO: 'MoMo',
  CREDIT_CARD: 'Thẻ tín dụng',
};
