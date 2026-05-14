'use client';

import { useMemo, useState } from 'react';

type PdpSpecsProps = {
  description?: string;
  specs?: Record<string, string | number | boolean | null | undefined>;
};

function formatSpecLabel(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatSpecValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  return String(value);
}

const PREVIEW_DESCRIPTION_LENGTH = 240;

function buildPreviewText(text: string): string {
  if (text.length <= PREVIEW_DESCRIPTION_LENGTH) return text;
  return `${text.slice(0, PREVIEW_DESCRIPTION_LENGTH).trimEnd()}...`;
}

export function PdpSpecs({ description, specs }: PdpSpecsProps) {
  const specEntries = Object.entries(specs ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== '');

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant sticky top-6">
      <h3 className="text-title-lg font-title-lg text-on-surface mb-6">Thông số kỹ thuật</h3>
      
      {specEntries.length > 0 ? (
        <div className="flex flex-col gap-4">
          {specEntries.slice(0, 10).map(([key, value]) => (
            <div key={key} className="flex justify-between text-body-md py-3 border-b border-outline-variant last:border-0">
              <span className="text-on-surface-variant w-1/3 pr-2">{formatSpecLabel(key)}</span>
              <span className="text-on-surface font-medium w-2/3 text-right">{formatSpecValue(value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-md text-on-surface-variant">Chưa có thông số kỹ thuật cho sản phẩm này.</p>
      )}

      {specEntries.length > 10 && (
        <button className="mt-6 w-full text-primary font-bold hover:underline flex items-center justify-center gap-1">
          Xem cấu hình chi tiết
          <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
        </button>
      )}
    </div>
  );
}
