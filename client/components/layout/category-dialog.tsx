'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { useMenuCategories } from '@/features/storefront/menu';

interface CategoryDialogProps {
  /**
   * Whether the dialog is open.
   */
  open: boolean;

  /**
   * Callback when dialog should close.
   */
  onClose: () => void;
}

/**
 * Category Menu Dialog — 3-tier hierarchical menu.
 *
 * Layout:
 * - Left column: Level 1 categories (clickable, shows highlight on selection).
 * - Right panel: Level 2 (group header) + Level 3 (clickable items with links).
 * - Closes on: Escape, click outside, item selection.
 * - Opens with: click + hover (hover has small delay to avoid flicker).
 *
 * Accessibility:
 * - Keyboard: Escape to close, Tab to navigate, Enter to select.
 * - ARIA: role="dialog", aria-expanded, aria-controls, aria-label.
 *
 * Responsive:
 * - Desktop only (hidden on mobile via parent header logic).
 */
export function CategoryDialog({ open, onClose }: CategoryDialogProps) {
  const { data: categories, loading, error } = useMenuCategories();
  const [activeL1Id, setActiveL1Id] = useState<string | null>(null);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Memoize active L1 category
  const activeL1 = useMemo(
    () => categories.find((cat) => cat.id === activeL1Id) ?? categories[0],
    [categories, activeL1Id],
  );

  // Set first category on mount or when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeL1Id) {
      setActiveL1Id(categories[0].id);
    }
  }, [categories, activeL1Id]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  const handleL1Click = useCallback((id: string) => {
    setActiveL1Id(id);
  }, []);

  const handleL1Hover = useCallback((id: string) => {
    if (hoverTimer) clearTimeout(hoverTimer);
    const timer = setTimeout(() => {
      setActiveL1Id(id);
    }, 150); // Small delay to avoid flicker
    setHoverTimer(timer);
  }, [hoverTimer]);

  const handleL1HoverLeave = useCallback(() => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  }, [hoverTimer]);

  const handleItemClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container - positioned absolutely below header */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Danh mục sản phẩm"
        className="absolute top-full left-1/2 z-40 mt-2 w-full max-w-container-max -translate-x-1/2 overflow-hidden rounded-md border border-[#e0e0e0] bg-white shadow-xl"
      >
        <div className="flex max-h-[min(75vh,640px)] min-h-85 flex-col overflow-hidden md:min-h-100 lg:flex-row">
          {/* Loading state */}
          {loading && (
            <div className="flex-1 flex items-center justify-center text-[#888]">
              <div className="animate-pulse text-sm">Đang tải danh mục...</div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex-1 flex items-center justify-center text-[#e30019] px-4 text-sm">
              Không thể tải danh mục. Vui lòng thử lại.
            </div>
          )}

          {/* Normal state (show structure even when empty) */}
          {!loading && !error && (
            <>
              {/* Left: Level 1 Categories */}
              <div className="w-full border-b border-[#e0e0e0] bg-[#fbf9f8] lg:w-65 lg:flex-none lg:border-b-0 lg:border-r lg:overflow-y-auto">
                {categories.length > 0 ? (
                  <div className="flex gap-1 overflow-x-auto px-2 py-2 lg:block lg:overflow-visible lg:px-0 lg:py-0">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleL1Click(cat.id)}
                        onMouseEnter={() => handleL1Hover(cat.id)}
                        onMouseLeave={handleL1HoverLeave}
                        className={`shrink-0 rounded-sm px-3 py-2 text-left text-[13px] font-medium whitespace-nowrap transition-colors lg:w-full lg:rounded-none lg:px-4 lg:py-3 ${
                          activeL1?.id === cat.id
                            ? 'bg-white text-[#004d75] lg:border-l-3 lg:border-[#004d75]'
                            : 'text-[#333] hover:bg-white/50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-[13px] text-[#999] italic">
                    Không có danh mục
                  </div>
                )}
              </div>

              {/* Right: Level 2 & 3 */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {categories.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[#888] text-sm">
                    Danh mục trống
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeL1 && Array.isArray(activeL1.children) && activeL1.children.length > 0 ? (
                      activeL1.children.map((l2) => (
                        <div key={l2.id}>
                          {/* Level 2 header (group title) */}
                          <h3 className="my-3 text-[14px] font-semibold text-[#1b1c1c]">
                            {l2.name}
                          </h3>

                          {/* Level 3 items (clickable links) */}
                          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.isArray(l2.children) && l2.children.length > 0 ? (
                              l2.children.map((l3) => (
                                <div key={l3.id}>
                                  {l3.slug ? (
                                    <Link
                                      href={`/product/collection/${l3.slug}`}
                                      className="group flex items-center justify-between rounded px-3 py-2 text-[12px] text-[#666] transition-colors hover:bg-[#f0f0f0] hover:text-[#004d75]"
                                      onClick={handleItemClick}
                                    >
                                      <span>{l3.name}</span>
                                      <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                    </Link>
                                  ) : (
                                    <span className="block px-3 py-2 text-[12px] text-[#999] cursor-not-allowed">
                                      {l3.name}
                                    </span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="block px-3 py-2 text-[12px] text-[#ccc] italic">
                                (Không có mục)
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[12px] text-[#888] italic">
                        Danh mục này không có mục con
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Close button (mobile-friendly, top-right) */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-[#999] hover:text-[#333] transition-colors lg:hidden"
                aria-label="Đóng danh mục"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
