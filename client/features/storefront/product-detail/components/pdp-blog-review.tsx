'use client';

import { useState } from 'react';

type PdpBlogReviewProps = {
  descriptionHtml?: string;
};

const BLOG_BASE_CSS = `
  :root {
    color-scheme: light;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #1f2937;
    font-family: "DM Sans", "Segoe UI", Roboto, sans-serif;
    line-height: 1.7;
  }

  .article-root {
    padding: 20px;
  }

  img,
  video,
  iframe {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
  }

  td,
  th {
    border: 1px solid #e5e7eb;
    padding: 10px;
    vertical-align: top;
  }

  a {
    color: #0052ff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.25rem;
    margin-bottom: 0.625rem;
    line-height: 1.3;
    color: #0f172a;
  }

  p,
  ul,
  ol {
    margin-top: 0;
    margin-bottom: 0.875rem;
  }
`;

function buildSrcDoc(descriptionHtml: string): string {
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${BLOG_BASE_CSS}</style>
  </head>
  <body>
    <main class="article-root">${descriptionHtml}</main>
  </body>
</html>`;
}

export function PdpBlogReview({ descriptionHtml }: PdpBlogReviewProps) {
  const [expanded, setExpanded] = useState(false);

  if (!descriptionHtml) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-4xl border border-border bg-bg-elevated shadow-sm">
      <header className="border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Bài review chi tiết</h2>
            <p className="mt-1 text-sm text-text-secondary">Nội dung review được hiển thị độc lập để giữ nguyên định dạng gốc.</p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs font-semibold uppercase tracking-widest text-primary transition hover:text-primary-dark"
          >
            {expanded ? 'Thu gọn' : 'Xem đầy đủ'}
          </button>
        </div>
      </header>

      <div className="relative">
        <iframe
          title="product-blog-review"
          srcDoc={buildSrcDoc(descriptionHtml)}
          sandbox="allow-same-origin"
          className={`w-full border-0 bg-white transition-[height] duration-300 ${expanded ? 'h-215' : 'h-72'}`}
        />
        {!expanded && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent" />}
      </div>
    </section>
  );
}
