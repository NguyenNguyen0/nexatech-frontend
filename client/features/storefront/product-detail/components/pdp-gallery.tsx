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
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full aspect-square md:aspect-[4/3] bg-surface-container rounded-2xl border border-outline-variant overflow-hidden group">
        <div className="absolute inset-0 bg-surface-container">
          {activeImage ? (
            <Image
              src={activeImage}
              alt={productName}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 hover:bg-surface text-on-surface rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-outline-variant shadow-sm"
              aria-label="Ảnh trước"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 hover:bg-surface text-on-surface rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-outline-variant shadow-sm"
              aria-label="Ảnh tiếp theo"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {sanitized.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {sanitized.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden cursor-pointer transition-colors ${
                  isActive ? 'border-2 border-primary' : 'border border-outline-variant hover:border-primary opacity-70 hover:opacity-100'
                }`}
                aria-label={`Ảnh ${index + 1}`}
              >
                <div className="w-full h-full relative bg-surface-container">
                  <Image src={image} alt={productName} fill unoptimized sizes="96px" className="object-cover" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
