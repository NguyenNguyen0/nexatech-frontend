'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PdpGalleryProps = {
  images: string[];
  productName: string;
};

export function PdpGallery({ images, productName }: PdpGalleryProps) {
  const sanitized = useMemo(() => images.filter((item) => Boolean(item?.trim())), [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = sanitized[activeIndex];
  const remainingCount = Math.max(sanitized.length - 4, 0);

  const goPrev = () => {
    if (sanitized.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + sanitized.length) % sanitized.length);
  };

  const goNext = () => {
    if (sanitized.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % sanitized.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-4xl border border-border bg-bg-elevated shadow-sm">
        <div className="aspect-square bg-bg-sunken">
          {activeImage ? (
            <Image
              src={activeImage}
              alt={productName}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-black text-primary">NT</div>
          )}
        </div>

        {sanitized.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-base/90 text-text-primary transition hover:border-primary hover:text-primary"
              aria-label="Anh truoc"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-base/90 text-text-primary transition hover:border-primary hover:text-primary"
              aria-label="Anh tiep theo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {sanitized.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {sanitized.slice(0, 4).map((image, index) => {
            const isActive = index === activeIndex;
            const showMoreBadge = index === 3 && remainingCount > 0;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative overflow-hidden rounded-2xl border bg-bg-elevated transition ${
                  isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary'
                }`}
                aria-label={`Anh ${index + 1}`}
              >
                <div className="relative aspect-square">
                  <Image src={image} alt={productName} fill unoptimized sizes="160px" className="object-cover" />
                </div>
                {showMoreBadge && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">+{remainingCount}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
