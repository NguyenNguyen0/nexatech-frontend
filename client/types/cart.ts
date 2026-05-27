export interface CartItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  flashSaleId?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface UpdateCartItemBody {
  quantity: number;
  /** Override the price fetched from product service (e.g. flash sale price) */
  priceOverride?: number;
  flashSaleId?: string;
}
