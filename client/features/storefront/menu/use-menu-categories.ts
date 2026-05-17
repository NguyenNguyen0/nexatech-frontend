/**
 * Hook to fetch and normalize category menu from API.
 * Memoizes to avoid redundant requests during component lifecycle.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCategoryMenu } from '@/features/products/services/products-api';
import { normalizeMenuCategories } from './normalize';
import type { MenuCategory } from './types';

interface UseMenuCategoriesState {
  data: MenuCategory[];
  loading: boolean;
  error: Error | null;
}

// Simple in-memory cache for menu during session
let menuCache: MenuCategory[] | null = null;
let menuError: Error | null = null;
let menuPromise: Promise<MenuCategory[]> | null = null;

function resetCache() {
  menuCache = null;
  menuError = null;
  menuPromise = null;
}

async function fetchAndNormalizeMenu(): Promise<MenuCategory[]> {
  // Return cached if available
  if (menuCache !== null) return menuCache;
  if (menuError) throw menuError;
  
  // Reuse in-flight request
  if (menuPromise) return menuPromise;
  
  menuPromise = (async () => {
    try {
      const categories = await fetchCategoryMenu();
      menuCache = normalizeMenuCategories(categories);
      menuError = null;
      return menuCache;
    } catch (err) {
      menuError = err instanceof Error ? err : new Error('Failed to fetch menu');
      throw menuError;
    }
  })();
  
  return menuPromise;
}

/**
 * Hook: fetch + normalize category menu once per session.
 * Returns { data, loading, error } state.
 */
export function useMenuCategories(): UseMenuCategoriesState {
  const [state, setState] = useState<UseMenuCategoriesState>({
    data: menuCache ?? [],
    loading: !menuCache && !menuError,
    error: menuError,
  });

  const fetchMenu = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchAndNormalizeMenu();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState((prev) => ({ ...prev, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    // Only fetch if not already cached/in-flight
    if (!menuCache && !menuPromise && !menuError) {
      fetchMenu();
    } else if (menuCache || menuError) {
      // Use cached result immediately
      setState({
        data: menuCache ?? [],
        loading: false,
        error: menuError,
      });
    }
  }, [fetchMenu]);

  return state;
}

/**
 * Reset menu cache (useful for testing or manual cache busting).
 */
export function resetMenuCache() {
  resetCache();
}
