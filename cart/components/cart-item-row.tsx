'use client';

import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { CartItem } from '@/types/cart';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  disabled?: boolean;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove, disabled }: CartItemRowProps) {
  return (
    <div className="group flex items-center gap-4 py-5 border-b border-border/50 last:border-0 transition-all duration-200 hover:bg-accent/30 rounded-2xl px-3 -mx-3">
      {/* Product Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl bg-secondary overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
            <Package className="size-8" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm sm:text-base leading-tight truncate pr-4">
          {item.productName}
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          {formatCurrency(item.unitPrice)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <button
            className="quantity-btn"
            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
            disabled={disabled || item.quantity <= 1}
            aria-label="Giảm số lượng"
          >
            <Minus className="size-3.5" />
          </button>

          <span className="w-8 text-center font-semibold text-sm tabular-nums">
            {item.quantity}
          </span>

          <button
            className="quantity-btn"
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            disabled={disabled}
            aria-label="Tăng số lượng"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Price & Delete */}
      <div className="flex flex-col items-end gap-2">
        <p className="font-semibold text-sm sm:text-base whitespace-nowrap">
          {formatCurrency(item.subtotal)}
        </p>
        <button
          onClick={() => onRemove(item.productId)}
          disabled={disabled}
          className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-full hover:bg-destructive/10"
          aria-label="Xóa sản phẩm"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
