import { cn } from '@/lib/utils';

type ConfigPresetBarProps = {
  presetLabels: string[];
  activeConfigIndex: number;
  onSelectPreset: (index: number) => void;
  onClearActiveConfig: () => void;
};

export function ConfigPresetBar({
  presetLabels,
  activeConfigIndex,
  onSelectPreset,
  onClearActiveConfig,
}: ConfigPresetBarProps) {
  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1">
        {presetLabels.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelectPreset(index)}
            className={cn(
              'rounded-sm px-3 py-1 text-[12px] font-bold transition-colors',
              index === activeConfigIndex
                ? 'bg-primary text-white'
                : 'bg-[#e8ecf1] text-[#666] hover:bg-[#dce3eb]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={onClearActiveConfig}
          className="inline-flex items-center gap-1 rounded-sm bg-primary px-3 py-1 text-[12px] font-bold text-white transition hover:bg-primary-dark"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Tạo lại
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-sm border border-primary px-3 py-1 text-[12px] font-bold text-primary transition hover:bg-primary/5"
        >
          Tải cấu hình
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </button>
      </div>
    </div>
  );
}
