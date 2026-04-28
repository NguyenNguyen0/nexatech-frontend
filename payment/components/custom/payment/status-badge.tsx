import { PaymentStatus, PAYMENT_STATUS_CONFIG } from '@/types/payment';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status];
  if (!config) return <span className="text-xs text-gray-500">{status}</span>;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
