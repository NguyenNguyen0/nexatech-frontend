/** Gateway routes → order-service */
export const ORDER_API_BASE = '/api/v1/orders';
export const CART_API_BASE = '/api/v1/cart';
export const CHECKOUT_API_BASE = '/api/v1/checkout';
export const RETURN_API_BASE = '/api/v1/returns';

export const orderPaths = {
    orders: ORDER_API_BASE,
    myOrders: `${ORDER_API_BASE}/my`,
    orderById: (id: string) => `${ORDER_API_BASE}/${id}`,
    cancelOrder: (id: string) => `${ORDER_API_BASE}/${id}/cancel`,
    updateStatus: (id: string) => `${ORDER_API_BASE}/${id}/status`,
    checkout: CHECKOUT_API_BASE,
    cart: CART_API_BASE,
    cartItems: `${CART_API_BASE}/items`,
    cartItemById: (productId: string) => `${CART_API_BASE}/items/${productId}`,
    returns: RETURN_API_BASE,
    returnById: (id: string) => `${RETURN_API_BASE}/${id}`,
    myReturns: `${RETURN_API_BASE}/my`,
    approveReturn: (id: string) => `${RETURN_API_BASE}/${id}/approve`,
    rejectReturn: (id: string) => `${RETURN_API_BASE}/${id}/reject`,
} as const;
