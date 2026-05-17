'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  getUserById,
  type UserProfileResult,
} from '@/features/auth/services/auth-api';
import { authStorage } from '@/features/auth/utils/auth-storage';

function decodeJwtSub(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return (decoded.sub as string) ?? null;
  } catch {
    return null;
  }
}

function resolveUserId(sessionUserId?: string): string | null {
  if (sessionUserId) return sessionUserId;
  const token = authStorage.getAccessToken();
  if (!token) return null;
  return decodeJwtSub(token);
}

export function useCurrentUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const userId = resolveUserId(session?.user?.id);
  const isAuthenticated = status === 'authenticated' && !!session?.accessToken;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setProfile(null);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    getUserById(userId)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId]);

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserById(userId);
      setProfile(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading: status === 'loading' || loading,
    error,
    isAuthenticated,
    userId,
    refresh,
  };
}
