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
    <section className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant relative overflow-hidden">
      <h2 className="text-headline-sm font-headline-sm text-on-surface mb-6">Thông tin sản phẩm</h2>

      <div className={`relative transition-[height] duration-300 ${expanded ? 'h-[800px]' : 'h-[400px]'}`}>
        <iframe
          title="product-blog-review"
          srcDoc={buildSrcDoc(descriptionHtml)}
          sandbox="allow-same-origin"
          className="w-full h-full border-0 bg-white rounded-xl"
        />
        
        {!expanded && (
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-surface to-transparent flex items-end justify-center pb-6">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="px-6 py-2 bg-surface border border-primary text-primary rounded-full font-bold hover:bg-primary/5 transition-colors shadow-sm"
            >
              Xem thêm nội dung
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="px-6 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-full font-bold hover:bg-surface-container transition-colors shadow-sm"
          >
            Thu gọn nội dung
          </button>
        </div>
      )}
    </section>
  );
}
