'use client';

import { useWishlistContext } from '@/features/wishlist/context/wishlist-provider';

export function useWishlist() {
  return useWishlistContext();
}
