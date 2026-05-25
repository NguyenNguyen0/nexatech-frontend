'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SessionTokenSync } from '@/components/auth/session-token-sync';
import { SessionHeartbeat } from '@/components/auth/session-heartbeat';
import { WishlistProvider } from '@/features/wishlist/context/wishlist-provider';

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <SessionTokenSync />
        <SessionHeartbeat />
      </Suspense>
      <WishlistProvider>{children}</WishlistProvider>
    </SessionProvider>
  );
}
