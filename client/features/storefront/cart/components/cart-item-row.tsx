import { Loader2, Trash2 } from 'lucide-react';
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
    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-3xl border border-border bg-bg-elevated p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto]">
      <div className="h-22 w-22 overflow-hidden rounded-2xl bg-bg-sunken sm:h-24 sm:w-24">
        {item.productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-semibold text-text-tertiary">NexaTech</div>
        )}
      </div>

      <div className="min-w-0 space-y-3">
        <div>
          <p className="line-clamp-2 text-sm font-semibold text-text-primary sm:text-base">{item.productName}</p>
          <p className="mt-1 text-sm text-text-secondary">Đơn giá: {formatCurrency(item.price)}</p>
          <p className="mt-1 text-base font-bold text-primary">{formatCurrency(item.totalPrice)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onDecrease(item.productId, item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-base text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Giảm số lượng"
          >
            -
          </button>
          <span className="inline-flex h-9 min-w-10 items-center justify-center rounded-xl border border-border bg-bg-base px-3 text-sm font-semibold text-text-primary">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrease(item.productId, item.quantity + 1)}
            disabled={updating}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-base text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Tăng số lượng"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            disabled={updating}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-base text-text-secondary transition hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Xóa sản phẩm"
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
