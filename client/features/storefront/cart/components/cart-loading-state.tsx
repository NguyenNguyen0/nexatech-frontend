import { Loader2 } from 'lucide-react';

export function CartLoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-text-secondary">Đang tải giỏ hàng...</p>
      </div>
    </div>
  );
}
