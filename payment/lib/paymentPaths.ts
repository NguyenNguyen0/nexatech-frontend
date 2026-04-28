/** Gateway routes → payment-service */
export const PAYMENT_API_BASE = '/api/v1/payments';
export const PAYMENT_ADMIN_BASE = '/api/v1/admin/payments';

export const paymentPaths = {
    payments: PAYMENT_API_BASE,
    myPayments: `${PAYMENT_API_BASE}/my`,
    paymentById: (id: string) => `${PAYMENT_API_BASE}/${id}`,
    paymentByOrderId: (orderId: string) => `${PAYMENT_API_BASE}/order/${orderId}`,
    createVNPay: `${PAYMENT_API_BASE}/vnpay/create`,
    vnpayCallback: `${PAYMENT_API_BASE}/vnpay/callback`,
    // Admin paths
    adminPayments: PAYMENT_ADMIN_BASE,
    adminPaymentById: (id: string) => `${PAYMENT_ADMIN_BASE}/${id}`,
    adminPaymentStats: `${PAYMENT_ADMIN_BASE}/stats`,
    adminRefund: (id: string) => `${PAYMENT_ADMIN_BASE}/${id}/refund`,
} as const;
