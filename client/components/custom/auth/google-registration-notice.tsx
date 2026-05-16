'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { authStorage } from '@/features/auth/utils/auth-storage';

const TOAST_MESSAGE =
  'Đã đăng ký tài khoản google thành công, vui lòng đăng nhập lại';
const PENDING_TOAST_KEY = 'nexatech:google-reg-toast-pending';

export function showGoogleRegistrationToast() {
  toast.success(TOAST_MESSAGE);
}

/** Hiển thị toast sau đăng ký Google lần đầu (kể cả khi middleware redirect khỏi /auth/login). */
export function GoogleRegistrationNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const handling = useRef(false);
  const toastShown = useRef(false);

  useEffect(() => {
    const fromQuery = searchParams.get('googleRegistered') === '1';
    const fromStorage = sessionStorage.getItem(PENDING_TOAST_KEY) === '1';

    if (!fromQuery && !fromStorage) {
      return;
    }
    if (toastShown.current) {
      return;
    }
    toastShown.current = true;
    sessionStorage.removeItem(PENDING_TOAST_KEY);
    showGoogleRegistrationToast();

    if (fromQuery) {
      const callbackUrl = searchParams.get('callbackUrl') ?? '/';
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.googleNewRegistration || handling.current) {
      return;
    }
    handling.current = true;

    void (async () => {
      sessionStorage.setItem(PENDING_TOAST_KEY, '1');
      authStorage.clear();
      await signOut({ redirect: false });

      const callbackUrl =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('callbackUrl') ?? '/'
          : '/';

      router.replace(
        `/auth/login?googleRegistered=1&callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
    })();
  }, [status, session?.googleNewRegistration, router]);

  return null;
}
