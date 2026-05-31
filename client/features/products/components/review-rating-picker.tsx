'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewRatingPickerProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ReviewRatingPicker({ value, onChange, disabled = false, size = 'md' }: ReviewRatingPickerProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const displayRating = hoverRating ?? value;
  const starClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => {
          if (!disabled) {
            setHoverRating(null);
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayRating;

          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              aria-label={`${star} sao`}
              aria-pressed={value === star}
              onMouseEnter={() => {
                if (!disabled) {
                  setHoverRating(star);
                }
              }}
              onClick={() => {
                if (!disabled) {
                  onChange(star);
                }
              }}
              className="rounded p-0.5 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Star className={filled ? `${starClass} fill-warning text-warning` : `${starClass} text-border`} />
            </button>
          );
        })}
      </div>
      <span className="text-label-sm font-medium text-on-surface-variant">{displayRating}/5 sao</span>
    </div>
  );
}
