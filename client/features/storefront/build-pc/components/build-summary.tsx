import { formatCurrency } from '@/lib/utils';
import type { BuildPart, BuildSelection } from '../types';

type BuildSummaryProps = {
  buildParts: BuildPart[];
  activeConfig: BuildSelection;
  selectedCount: number;
  total: number;
};

export function BuildSummary({ buildParts, activeConfig, selectedCount, total }: BuildSummaryProps) {
  return (
    <aside>
      <div className="sticky top-28 rounded-md border border-[#e8e8e8] bg-white p-4 shadow-sm">
        <h2 className="mb-4 border-b border-outline-variant pb-2 text-title-lg font-title-lg text-primary">
          Build Summary
        </h2>

        {selectedCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-md bg-[#f5f5f5] opacity-40">
              <span className="material-symbols-outlined text-[64px] text-outline">
                desktop_windows
              </span>
            </div>
            <p className="max-w-52 text-label-sm text-outline">
              Chưa có linh kiện nào trong danh sách cấu hình của bạn.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {buildParts.map((part) => {
              const selectedItem = activeConfig[part.key];
              if (!selectedItem) return null;

              return (
                <div
                  key={part.key}
                  className="flex items-start justify-between gap-3 border-b border-outline-variant/70 pb-3 last:border-b-0"
                >
                  <div>
                    <p className="text-label-sm font-bold uppercase text-on-surface-variant">
                      {part.shortLabel}
                    </p>
                    <p className="text-label-sm text-on-surface">{selectedItem.name}</p>
                  </div>
                  <span className="shrink-0 text-label-sm font-medium text-primary">
                    {formatCurrency(selectedItem.price)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="flex items-end justify-between border-t border-outline-variant pt-4">
            <span className="font-bold text-on-surface-variant">Tổng tiền:</span>
            <span className="text-headline-md font-display-lg text-primary">{formatCurrency(total)}</span>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-[13px] font-bold text-white transition hover:bg-primary-dark"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Nhận tư vấn từ chuyên gia
          </button>

          <button
            type="button"
            disabled={selectedCount === 0}
            className="w-full rounded-md border border-primary py-2 text-[12px] font-bold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-[#ddd] disabled:text-[#999]"
          >
            Thêm tất cả vào giỏ
          </button>

          <p className="text-center text-[11px] text-outline">
            Giá đã bao gồm VAT và các chương trình khuyến mãi hiện có.
          </p>
        </div>
      </div>
    </aside>
  );
}
