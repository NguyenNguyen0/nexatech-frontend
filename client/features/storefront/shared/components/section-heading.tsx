import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  kicker: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
};

export function SectionHeading({ kicker, title, description, align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{kicker}</p>
      <h2 className="mt-2 font-display text-3xl font-bold text-text-primary sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">{description}</p> : null}
    </div>
  );
}
