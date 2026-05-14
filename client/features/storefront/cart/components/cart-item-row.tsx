import { Loader2 } from 'lucide-react';
import type { CartItem } from '@/types/cart';
import { formatCurrency } from '@/lib/utils';

type CartItemRowProps = {
  item: CartItem;
  updating: boolean;
  onDecrease: (productId: string, quantity: number) => void;
  onIncrease: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartItemRow({ item, updating, onDecrease, onIncrease, onRemove }: CartItemRowProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-outline-variant last:border-b-0">
      <div className="w-24 h-24 bg-surface-container rounded-lg border border-outline-variant shrink-0 relative overflow-hidden">
        {item.productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-outline text-[32px]">inventory_2</span>
          </div>
        )}
      </div>
      
      <div className="flex-grow flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-title-lg font-title-lg text-on-surface line-clamp-2 hover:text-primary transition-colors cursor-pointer">
              {item.productName}
            </h3>
            {/* Mock variant info if needed in the future */}
            <p className="text-label-sm text-on-surface-variant mt-1">Đơn giá: {formatCurrency(item.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            disabled={updating}
            className="text-on-surface-variant hover:text-error transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Xóa"
          >
            {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="material-symbols-outlined text-[20px]">delete</span>}
          </button>
        </div>
        
        <div className="flex justify-between items-end mt-4">
          <div className="text-title-lg font-title-lg text-primary">{formatCurrency(item.totalPrice)}</div>
          <div className="flex items-center h-9 bg-surface-container-low border border-outline-variant rounded-lg">
            <button
              type="button"
              onClick={() => onDecrease(item.productId, item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="w-9 h-full flex items-center justify-center text-on-surface hover:text-primary transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <div className="w-10 h-full flex items-center justify-center text-body-md font-medium text-on-surface border-x border-outline-variant">
              {item.quantity}
            </div>
            <button
              type="button"
              onClick={() => onIncrease(item.productId, item.quantity + 1)}
              disabled={updating}
              className="w-9 h-full flex items-center justify-center text-on-surface hover:text-primary transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
