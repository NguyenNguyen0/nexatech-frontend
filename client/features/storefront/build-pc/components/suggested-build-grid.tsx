'use client';

import { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { SuggestedBuild } from '../types';
import { SuggestedBuildCard } from './suggested-build-card';

type SuggestedBuildGridProps = {
  suggestedBuilds: SuggestedBuild[];
  isLoading: boolean;
  dataError: string | null;
};

export function SuggestedBuildGrid({ suggestedBuilds, isLoading, dataError }: SuggestedBuildGridProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  if (dataError) {
    return (
      <div className="rounded-md border border-[#fde8e8] bg-[#fff5f5] px-4 py-6 text-center text-[13px] text-[#e30019]">
        <span className="material-symbols-outlined mb-1 text-[28px]">error_outline</span>
        <p className="font-semibold">Không thể tải dữ liệu</p>
        <p className="mt-0.5 text-[#666]">{dataError}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-64 w-56 shrink-0 animate-pulse rounded-md border border-[#e8e8e8] bg-[#f5f5f5]"
          />
        ))}
      </div>
    );
  }

  if (suggestedBuilds.length === 0) {
    return (
      <div className="rounded-md border border-[#e8e8e8] bg-white px-4 py-8 text-center text-[13px] text-[#666]">
        <p className="font-semibold text-[#333]">Chưa có cấu hình gợi ý</p>
        <p className="mt-1">Backend đã trả về danh sách rỗng cho nhóm sản phẩm này.</p>
      </div>
    );
  }

  // Show carousel only if more than 4 items (assumes ~4-5 visible items per row)
  const showCarousel = suggestedBuilds.length > 4;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {suggestedBuilds.map((build) => (
            <div
              key={build.id}
              className="min-w-0 shrink-0 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <SuggestedBuildCard build={build} />
            </div>
          ))}
        </div>
      </div>

      {showCarousel ? (
        <div className="flex items-center justify-center gap-2">
          <button
            ref={prevBtnRef}
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Trước"
            className="rounded-sm border border-[#ddd] p-2 text-outline transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="text-[13px] text-on-surface-variant">
            Cuộn để xem thêm
          </span>
          <button
            ref={nextBtnRef}
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Sau"
            className="rounded-sm border border-[#ddd] p-2 text-outline transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
