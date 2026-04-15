'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center gap-4 py-4 border-b last:border-b-0">
      <div className="size-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} className="size-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">Ảnh</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.productName}</p>
        <p className="text-sm text-muted-foreground mt-1">{formatCurrency(item.price)}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
          disabled={disabled || item.quantity <= 1}
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          disabled={disabled}
        >
          <Plus className="size-3" />
        </Button>
      </div>

      <p className="w-28 text-right font-semibold text-sm">
        {formatCurrency(item.price * item.quantity)}
      </p>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(item.productId)}
        disabled={disabled}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
