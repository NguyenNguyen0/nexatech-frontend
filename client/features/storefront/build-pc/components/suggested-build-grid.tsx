import type { SuggestedBuild } from '../types';
import { SuggestedBuildCard } from './suggested-build-card';

type SuggestedBuildGridProps = {
  suggestedBuilds: SuggestedBuild[];
  isLoading: boolean;
  dataError: string | null;
};

export function SuggestedBuildGrid({ suggestedBuilds, isLoading, dataError }: SuggestedBuildGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {dataError ? (
        <div className="col-span-5 rounded-md border border-[#fde8e8] bg-[#fff5f5] px-4 py-6 text-center text-[13px] text-[#e30019]">
          <span className="material-symbols-outlined mb-1 text-[28px]">error_outline</span>
          <p className="font-semibold">Không thể tải dữ liệu</p>
          <p className="mt-0.5 text-[#666]">{dataError}</p>
        </div>
      ) : isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-md border border-[#e8e8e8] bg-[#f5f5f5]"
          />
        ))
      ) : suggestedBuilds.length === 0 ? (
        <div className="col-span-5 rounded-md border border-[#e8e8e8] bg-white px-4 py-8 text-center text-[13px] text-[#666]">
          <p className="font-semibold text-[#333]">Chưa có cấu hình gợi ý</p>
          <p className="mt-1">Backend đã trả về danh sách rỗng cho nhóm sản phẩm này.</p>
        </div>
      ) : (
        suggestedBuilds.map((build) => <SuggestedBuildCard key={build.id} build={build} />)
      )}
    </div>
  );
}
