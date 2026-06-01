'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  addToWishlist,
  getAllWishlistedProductIds,
  getWishlistErrorMessage,
  migrateLegacyWishlistToBackend,
  removeFromWishlist,
} from '@/features/wishlist/services/wishlist-api';
import { authStorage } from '@/features/auth/utils/auth-storage';

interface WishlistContextValue {
  wishlistedIds: Set<string>;
  wishlistCount: number;
  isHydrating: boolean;
  isMutating: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean | null>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function toNextState(
  current: Set<string>,
  productId: string,
  wishlisted: boolean,
): Set<string> {
  const next = new Set(current);
  if (wishlisted) {
    next.add(productId);
  } else {
    next.delete(productId);
  }
  return next;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [isHydrating, setIsHydrating] = useState(false);
  const [mutatingIds, setMutatingIds] = useState<Set<string>>(new Set());
  const hasHydratedRef = useRef(false);

  const isAuthenticated = status === 'authenticated' && session?.otpStepUpPending !== true;

  const ensureWishlistAuth = useCallback(() => {
    if (!isAuthenticated) return false;

    if (session?.accessToken && session.refreshToken) {
      authStorage.setTokens(session.accessToken, session.refreshToken);
    }

    return Boolean(authStorage.getAccessToken());
  }, [isAuthenticated, session?.accessToken, session?.refreshToken]);

  const hydrateWishlist = useCallback(async () => {
    if (!ensureWishlistAuth()) return;

    setIsHydrating(true);
    try {
      await migrateLegacyWishlistToBackend();
      const ids = await getAllWishlistedProductIds();
      setWishlistedIds(ids);
      hasHydratedRef.current = true;
    } catch {
      // Keep current state; page-level actions will retry on demand.
    } finally {
      setIsHydrating(false);
    }
  }, [ensureWishlistAuth]);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    await hydrateWishlist();
  }, [hydrateWishlist, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistedIds(new Set());
      setMutatingIds(new Set());
      hasHydratedRef.current = false;
      setIsHydrating(false);
      return;
    }

    if (!hasHydratedRef.current) {
      void hydrateWishlist();
    }
  }, [hydrateWishlist, isAuthenticated]);

  const markMutating = useCallback((productId: string, value: boolean) => {
    setMutatingIds((current) => {
      const next = new Set(current);
      if (value) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  }, []);

  const toggleWishlist = useCallback(async (productId: string): Promise<boolean | null> => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích');
      return null;
    }

    if (!ensureWishlistAuth()) {
      toast.error('Phiên đăng nhập chưa sẵn sàng. Vui lòng thử lại hoặc đăng nhập lại.');
      return null;
    }

    if (mutatingIds.has(productId)) {
      return wishlistedIds.has(productId);
    }

    const currentlyWishlisted = wishlistedIds.has(productId);
    const optimisticWishlisted = !currentlyWishlisted;

    setWishlistedIds((current) => toNextState(current, productId, optimisticWishlisted));
    markMutating(productId, true);

    try {
      const result = currentlyWishlisted
        ? await removeFromWishlist(productId)
        : await addToWishlist(productId);

      setWishlistedIds((current) => toNextState(current, productId, result.wishlisted));
      return result.wishlisted;
    } catch (error) {
      setWishlistedIds((current) => toNextState(current, productId, currentlyWishlisted));
      toast.error(getWishlistErrorMessage(error));
      return null;
    } finally {
      markMutating(productId, false);
    }
  }, [ensureWishlistAuth, isAuthenticated, markMutating, mutatingIds, wishlistedIds]);

  const value = useMemo<WishlistContextValue>(() => ({
    wishlistedIds,
    wishlistCount: wishlistedIds.size,
    isHydrating,
    isMutating: (productId: string) => mutatingIds.has(productId),
    isWishlisted: (productId: string) => wishlistedIds.has(productId),
    toggleWishlist,
    refreshWishlist,
  }), [isHydrating, mutatingIds, refreshWishlist, toggleWishlist, wishlistedIds]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within WishlistProvider');
  }
  return context;
}
