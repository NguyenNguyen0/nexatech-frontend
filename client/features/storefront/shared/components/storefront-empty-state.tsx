import { cn } from '@/lib/utils';

type StorefrontEmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function StorefrontEmptyState({ title, description, className }: StorefrontEmptyStateProps) {
  return (
    <div className={cn('rounded-[1.75rem] border border-dashed border-border bg-bg-elevated px-6 py-14 text-center', className)}>
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </div>
  );
}
