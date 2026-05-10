'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';
import { fetchProductSuggestions } from '@/features/products/services/products-api';
import type { ProductSuggestion } from '@/features/products/types';

interface ProductSearchProps {
  className?: string;
  placeholder?: string;
}

export function ProductSearch({ className, placeholder = 'Tìm kiếm sản phẩm, thương hiệu...' }: ProductSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmed = keyword.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await fetchProductSuggestions(trimmed, { limit: 6 });
        setSuggestions(result);
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [keyword]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
  };

  const goToSuggestion = (slug: string) => {
    router.push(`/product/${slug}`);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full', className)}>
      <form
        onSubmit={submitSearch}
        className="flex h-12 items-center gap-2 rounded-full border border-border bg-bg-base px-3 shadow-sm transition focus-within:border-primary"
      >
        <Search className="h-4 w-4 text-text-tertiary" />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onFocus={() => keyword.trim().length >= 2 && setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          type="search"
          placeholder={placeholder}
          className="h-auto flex-1 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
        />
        {keyword ? (
          <button
            type="button"
            onClick={() => setKeyword('')}
            className="rounded-full p-1 text-text-tertiary transition hover:bg-gray-100 hover:text-text-primary"
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Tìm
        </button>
      </form>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-3xl border border-border bg-bg-elevated shadow-2xl">
          {loading ? (
            <div className="p-4 text-sm text-text-secondary">Đang tìm sản phẩm...</div>
          ) : suggestions.length > 0 ? (
            <div className="divide-y divide-border">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goToSuggestion(item.slug)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-2xl bg-bg-sunken">
                    {item.thumbnail ? <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-tertiary">{formatCurrency(item.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-text-secondary">Không có gợi ý phù hợp.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
