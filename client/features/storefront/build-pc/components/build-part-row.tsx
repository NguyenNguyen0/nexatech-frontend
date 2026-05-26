import { formatCurrency } from '@/lib/utils';
import type { BuildPart, CatalogItem } from '../types';

type BuildPartRowProps = {
  part: BuildPart;
  selectedItem?: CatalogItem;
  onChoose: () => void;
  onDelete?: () => void;
};

export function BuildPartRow({ part, selectedItem, onChoose, onDelete }: BuildPartRowProps) {
  return (
    <article className="flex min-h-20 items-center justify-between gap-4 rounded-md border border-[#e8e8e8] bg-white px-3 py-2 transition hover:border-primary/50">
      <div className="flex min-w-0 items-center gap-4">
        <div className="w-16 shrink-0">
          <p className="text-label-sm font-bold uppercase text-on-surface">{part.shortLabel}</p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-dashed border-[#ddd] bg-white">
          <span className="material-symbols-outlined text-outline">{part.icon}</span>
        </div>

        <div className="min-w-0">
          {selectedItem ? (
            <>
              <p className="truncate text-body-md font-medium text-on-surface">{selectedItem.name}</p>
              <p className="text-label-sm text-on-surface-variant">{formatCurrency(selectedItem.price)}</p>
            </>
          ) : (
            <>
              <p className="text-body-md italic text-outline">Vui lòng chọn linh kiện</p>
              <p className="hidden text-label-sm text-on-surface-variant sm:block">{part.description}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        {selectedItem && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Xóa"
            className="rounded-sm border border-[#ddd] p-1.5 text-outline transition hover:bg-[#fee]"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={onChoose}
          className="rounded-sm bg-primary px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-primary-dark"
        >
          {selectedItem ? 'Đổi' : 'Chọn'}
        </button>
      </div>
    </article>
  );
}
