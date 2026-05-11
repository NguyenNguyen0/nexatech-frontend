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
  const [expanded, setExpanded] = useState(false);
  const specEntries = Object.entries(specs ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== '');
  const quickInfoText = description?.trim() || 'Chưa có mô tả chi tiết cho sản phẩm này.';
  const quickInfoPreview = useMemo(() => buildPreviewText(quickInfoText), [quickInfoText]);
  const canExpandQuickInfo = quickInfoText.length > PREVIEW_DESCRIPTION_LENGTH;

  return (
    <div className="space-y-6 rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      {/* Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Thông tin nhanh</h2>
          {canExpandQuickInfo && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-xs font-semibold uppercase tracking-widest text-primary transition hover:text-primary-dark"
            >
              {expanded ? 'Thu gọn' : 'Xem đầy đủ'}
            </button>
          )}
        </div>

        <p className="whitespace-pre-line text-sm leading-7 text-text-secondary">{expanded ? quickInfoText : quickInfoPreview}</p>
      </div>

      {/* Specs table */}
      <div className="overflow-hidden rounded-3xl border border-border bg-bg-base">
        <div className="border-b border-border bg-bg-elevated px-4 py-3">
          <h3 className="text-sm font-semibold text-text-primary">Thông số kỹ thuật</h3>
        </div>

        {specEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <tbody>
                {specEntries.map(([key, value]) => (
                  <tr key={key} className="border-b border-border last:border-b-0">
                    <th className="w-1/3 bg-bg-elevated px-4 py-3 text-left font-semibold text-text-primary">
                      {formatSpecLabel(key)}
                    </th>
                    <td className="px-4 py-3 text-text-secondary">{formatSpecValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-4 py-3 text-sm text-text-secondary">Chưa có thông số kỹ thuật cho sản phẩm này.</p>
        )}
      </div>
    </div>
  );
}
