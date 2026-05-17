'use client';

import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserAvatarProps = {
  avatarUrl?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
};

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UserAvatar({ avatarUrl, name, size = 'sm', className }: UserAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (avatarUrl?.trim()) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl.trim()}
        alt={name ? `Avatar ${name}` : 'Avatar'}
        referrerPolicy="no-referrer"
        className={cn(
          'rounded-full object-cover ring-2 ring-white/80',
          sizeClass,
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary',
        sizeClass,
        className,
      )}
      aria-hidden={!name}
    >
      {name ? initialsFromName(name) : <UserRound className="h-[45%] w-[45%]" />}
    </span>
  );
}
