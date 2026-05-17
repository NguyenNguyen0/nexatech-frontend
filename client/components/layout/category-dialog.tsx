'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { useMenuCategories } from '@/features/storefront/menu';
import type { MenuCategory } from '@/features/storefront/menu/types';

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
    <div
      role="dialog"
      aria-modal="true"
      aria-expanded={open}
      aria-label="Danh mục sản phẩm"
      className="fixed inset-0 z-40"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        ref={dialogRef}
        className="absolute left-0 top-full mt-0 w-full max-w-[1200px] bg-white shadow-lg border-t border-[#e0e0e0]"
      >
        <div className="flex h-[400px] overflow-hidden">
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

          {/* Empty state */}
          {!loading && !error && categories.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[#888] text-sm">
              Chưa có danh mục
            </div>
          )}

          {/* Category content */}
          {!loading && !error && categories.length > 0 && (
            <>
              {/* Left: Level 1 Categories */}
              <div className="w-[220px] border-r border-[#e0e0e0] overflow-y-auto bg-[#fbf9f8]">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleL1Click(cat.id)}
                    onMouseEnter={() => handleL1Hover(cat.id)}
                    onMouseLeave={handleL1HoverLeave}
                    className={`w-full px-4 py-3 text-left text-[13px] font-medium transition-colors ${
                      activeL1?.id === cat.id
                        ? 'bg-white text-[#004d75] border-l-3 border-[#004d75]'
                        : 'text-[#333] hover:bg-white/50'
                    }`}
                    aria-selected={activeL1?.id === cat.id}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Right: Level 2 & 3 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeL1 && Array.isArray(activeL1.children) && activeL1.children.length > 0 ? (
                  activeL1.children.map((l2) => (
                    <div key={l2.id}>
                      {/* Level 2 header (group title) */}
                      <h3 className="text-[13px] font-semibold text-[#1b1c1c] mb-3">
                        {l2.name}
                      </h3>

                      {/* Level 3 items (clickable links) */}
                      <div className="space-y-2">
                        {Array.isArray(l2.children) && l2.children.length > 0 ? (
                          l2.children.map((l3) => (
                            <div key={l3.id}>
                              {l3.slug ? (
                                <Link
                                  href={`/product/collection/${l3.slug}`}
                                  className="flex items-center justify-between px-3 py-2 text-[12px] text-[#666] hover:text-[#004d75] hover:bg-[#f0f0f0] rounded transition-colors group"
                                  onClick={handleItemClick}
                                >
                                  <span>{l3.name}</span>
                                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
    </div>
  );
}
