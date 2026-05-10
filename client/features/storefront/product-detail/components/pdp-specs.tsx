type PdpSpecsProps = {
  slug: string;
  id: string | number;
  description?: string;
  descriptionHtml?: string;
};

export function PdpSpecs({ slug, id, description, descriptionHtml }: PdpSpecsProps) {
  return (
    <div className="space-y-6 rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      {/* Description */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">Mô tả sản phẩm</h2>
        {descriptionHtml ? (
          <div
            className="prose prose-sm max-w-none text-text-secondary prose-headings:text-text-primary prose-p:text-text-secondary"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        ) : (
          <p className="whitespace-pre-line text-sm leading-7 text-text-secondary">
            {description ?? 'Chưa có mô tả chi tiết cho sản phẩm này.'}
          </p>
        )}
      </div>

      {/* Specs grid */}
      <div className="grid gap-3 rounded-3xl border border-border bg-bg-base p-4 text-sm text-text-secondary sm:grid-cols-2">
        <div className="rounded-2xl bg-bg-elevated px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Slug</p>
          <p className="mt-1 font-medium text-text-primary">{slug}</p>
        </div>
        <div className="rounded-2xl bg-bg-elevated px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Mã sản phẩm</p>
          <p className="mt-1 font-medium text-text-primary">{id}</p>
        </div>
      </div>
    </div>
  );
}
