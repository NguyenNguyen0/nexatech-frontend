'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Monitor,
  MapPin,
  Clock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  fetchMySessions,
  signOutSession,
  signOutAllDevices,
} from '@/features/storefront/account/services/session-api';
import { useSessionHeartbeat } from '@/features/auth/hooks/use-session-heartbeat';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { logout } from '@/features/auth/services/auth-api';
import type { SessionItem } from '@/types/session';

function formatTimestamp(iso: string | undefined | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function SessionCard({
  session,
  onSignOut,
  signingOut,
}: {
  session: SessionItem;
  onSignOut: (id: string) => void;
  signingOut: boolean;
}) {
  const clientNames = Object.values(session.clients ?? {}).join(', ') || '—';

  return (
    <div
      className={[
        'rounded-2xl border p-4 transition',
        session.current
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-bg-base hover:border-primary/30',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Monitor className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {session.current && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <ShieldCheck className="h-3 w-3" />
                  Phiên hiện tại
                </span>
              )}
              <span className={[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                session.type === 'OFFLINE'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-success/10 text-success',
              ].join(' ')}>
                {session.type === 'OFFLINE' ? 'Offline' : 'REGULAR'}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-tertiary">{clientNames}</p>
          </div>
        </div>

        {!session.current && (
          <button
            onClick={() => onSignOut(session.id)}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/5 px-3 py-1.5 text-xs font-semibold text-error hover:bg-error hover:text-white disabled:opacity-60 transition"
          >
            {signingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            Đăng xuất
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary/70" />
          {session.ipAddress || '—'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary/70" />
          Bắt đầu: {formatTimestamp(session.started)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary/70" />
          Truy cập cuối: {formatTimestamp(session.lastAccess)}
        </span>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  useSessionHeartbeat();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOutId, setSigningOutId] = useState<string | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const loadSessions = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await fetchMySessions();
      setSessions(data);
    } catch {
      toast.error('Không thể tải danh sách phiên đăng nhập');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSignOut = async (sessionId: string) => {
    setSigningOutId(sessionId);
    try {
      await signOutSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success('Đã đăng xuất phiên đăng nhập');
    } catch {
      toast.error('Không thể đăng xuất phiên này');
    } finally {
      setSigningOutId(null);
    }
  };

  const handleSignOutAll = async () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả thiết bị không? Bạn sẽ bị đăng xuất ngay lập tức.')) {
      return;
    }
    setSigningOutAll(true);
    try {
      await signOutAllDevices();
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await logout(refreshToken).catch(() => {});
      }
      authStorage.clear();
      toast.success('Đã đăng xuất tất cả thiết bị. Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1200);
    } catch {
      toast.error('Không thể đăng xuất tất cả thiết bị');
      setSigningOutAll(false);
    }
  };

  const otherCount = sessions.filter((s) => !s.current).length;

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Bảo mật</p>
              <h2 className="mt-1 text-xl font-bold text-text-primary">Phiên đăng nhập</h2>
              <p className="mt-0.5 text-sm text-text-secondary">
                Quản lý tất cả thiết bị đang đăng nhập vào tài khoản của bạn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadSessions(true)}
              disabled={refreshing || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-base text-text-secondary hover:border-primary hover:text-primary disabled:opacity-60 transition"
              title="Làm mới"
            >
              <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
            </button>
            {otherCount > 0 && (
              <button
                onClick={handleSignOutAll}
                disabled={signingOutAll}
                className="inline-flex items-center gap-2 rounded-xl bg-error px-4 py-2 text-sm font-bold text-white hover:bg-error/90 disabled:opacity-60 transition"
              >
                {signingOutAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Đăng xuất tất cả
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <Monitor className="h-10 w-10 text-text-tertiary" />
            <p className="mt-3 text-sm font-medium text-text-secondary">Không tìm thấy phiên đăng nhập</p>
            <p className="text-xs text-text-tertiary">Vui lòng thử làm mới trang.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onSignOut={handleSignOut}
                signingOut={signingOutId === session.id}
              />
            ))}
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <p className="mt-4 text-xs text-text-tertiary">
            {sessions.length} phiên tổng · {otherCount} thiết bị khác
          </p>
        )}
      </section>
    </div>
  );
}
