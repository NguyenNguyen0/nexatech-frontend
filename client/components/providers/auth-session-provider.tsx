'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SessionTokenSync } from '@/components/auth/session-token-sync';

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <SessionTokenSync />
      </Suspense>
      {children}
    </SessionProvider>
  );
}
