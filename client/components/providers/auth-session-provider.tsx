'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SessionTokenSync } from '@/components/auth/session-token-sync';
import { SessionHeartbeat } from '@/components/auth/session-heartbeat';

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <SessionTokenSync />
        <SessionHeartbeat />
      </Suspense>
      {children}
    </SessionProvider>
  );
}
