'use client';

import { type FormEvent, type KeyboardEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { trackBehavior } from '@/features/behavior/services/behavior-api';
import { cn, formatCurrency } from '@/lib/utils';
import { fetchProductSuggestions } from '@/features/products/services/products-api';
import type { ProductSuggestion } from '@/features/products/types';
import { ChevronRight } from 'lucide-react';

const SEARCH_SUGGESTION_DEBOUNCE_MS = 300;

interface ProductSearchProps {
  className?: string;
  formClassName?: string;
  placeholder?: string;
}

export function ProductSearch({ className, formClassName, placeholder = 'Tìm kiếm sản phẩm, thương hiệu...' }: ProductSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = keyword.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setTotalItems(0);
      setLoading(false);
      setActiveIndex(-1);
      setErrorMessage(null);
      return;
    }

    const handle = window.setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      setErrorMessage(null);
      try {
        const { suggestions: items, totalItems: count } = await fetchProductSuggestions(trimmed, { limit: 6 });
        setSuggestions(items);
        setTotalItems(count);
        setActiveIndex(items.length > 0 ? 0 : -1);
      } catch {
        setSuggestions([]);
        setTotalItems(0);
        setActiveIndex(-1);
        setErrorMessage('Không thể tải gợi ý lúc này. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }, SEARCH_SUGGESTION_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [keyword]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const goToSuggestion = (suggestion: ProductSuggestion) => {
    void trackBehavior({
      productId: suggestion.id,
      eventType: 'SEARCH_CLICK',
      categoryIds: suggestion.categoryIds,
      brandId: suggestion.brandId,
      price: suggestion.price,
    }).catch(() => {
      // Navigation should not be blocked by analytics failures.
    });

    router.push(`/product/${suggestion.slug}`);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < suggestions.length) {
      // Let the form submit handler take over — always navigate to the search page.
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const goToAllResults = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
    setActiveIndex(-1);
    setKeyword('');
  };

  return (
    <div className={cn('relative w-full', className)}>
      <form
        onSubmit={submitSearch}
        className={cn(
          'flex h-12 items-center gap-2 overflow-hidden rounded-full border border-border bg-bg-base pl-3 shadow-sm transition focus-within:border-primary',
          formClassName,
        )}
      >
        <Search className="h-4 w-4 text-text-tertiary" />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onFocus={() => keyword.trim().length >= 2 && setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={handleKeyDown}
          type="search"
          placeholder={placeholder}
          className="h-auto flex-1 border-0 bg-transparent px-0 py-0 text-base leading-tight caret-primary shadow-none focus-visible:ring-0"
        />
        {keyword ? (
          <button
            type="button"
            onClick={() => {
              setKeyword('');
              setErrorMessage(null);
              setSuggestions([]);
              setActiveIndex(-1);
            }}
            className="rounded-full p-1 text-text-tertiary transition hover:bg-gray-100 hover:text-text-primary"
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="submit"
          className="flex h-full w-10 shrink-0 items-center justify-center bg-primary text-white transition hover:bg-primary-dark"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded border border-border bg-bg-elevated shadow-lg">
          {loading ? (
            <div className="p-4 text-sm text-text-secondary">Đang tìm sản phẩm...</div>
          ) : errorMessage ? (
            <div className="p-4 text-sm text-danger">{errorMessage}</div>
          ) : suggestions.length > 0 ? (
            <div>
              <div className="divide-y divide-border">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => goToSuggestion(item)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50',
                      suggestions[activeIndex]?.id === item.id ? 'bg-gray-50' : ''
                    )}
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
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={goToAllResults}
                className="flex w-full items-center justify-between border-t border-border px-4 py-2.5 text-sm text-primary transition hover:bg-gray-50"
              >
                <span>
                  Xem tất cả{' '}
                  <span className="font-semibold">{totalItems.toLocaleString('vi-VN')}</span>
                  {' '}kết quả cho &ldquo;{keyword.trim()}&rdquo;
                </span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          ) : (
            <div className="p-4 text-sm text-text-secondary">Không có gợi ý phù hợp.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
