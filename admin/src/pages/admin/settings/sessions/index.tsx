import { useEffect, useState } from 'react'
import {
  IconDeviceDesktop,
  IconLoader2,
  IconLogout,
  IconMapPin,
  IconRefresh,
  IconShieldLock,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { fetchMySessions, signOutAllDevices, signOutSession } from '@/services/sessionApi'
import type { SessionItem } from '@/types/session'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function SessionCard({
  session,
  onSignOut,
  signingOut,
}: {
  session: SessionItem
  onSignOut: (id: string) => void
  signingOut: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        session.current
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-card'
      }`}
    >
      <div className='flex items-start justify-between gap-3'>
        {/* Left: icon + details */}
        <div className='flex min-w-0 flex-1 gap-3'>
          <div className='mt-0.5 shrink-0'>
            <IconDeviceDesktop
              size={20}
              className={session.current ? 'text-primary' : 'text-muted-foreground'}
            />
          </div>

          <div className='min-w-0 space-y-1.5'>
            {/* Top row: current badge + type */}
            <div className='flex flex-wrap items-center gap-1.5'>
              {session.current && (
                <Badge variant='default' className='text-xs'>
                  Current session
                </Badge>
              )}
              <Badge variant='outline' className='text-xs'>
                {session.type}
              </Badge>
              {session.rememberMe && (
                <Badge variant='secondary' className='text-xs'>
                  Remember me
                </Badge>
              )}
            </div>

            {/* IP */}
            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
              <IconMapPin size={13} className='shrink-0' />
              <span className='font-mono text-xs'>{session.ipAddress}</span>
            </div>

            {/* Clients */}
            {/* {session.clients.length > 0 && (
              <div className='flex flex-wrap gap-1'>
                {session.clients.map((c) => (
                  <Badge key={c} variant='secondary' className='text-xs font-normal'>
                    {c}
                  </Badge>
                ))}
              </div>
            )} */}

            {/* Times */}
            <div className='flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:gap-4'>
              <span>
                <span className='font-medium text-foreground/70'>Started:</span>{' '}
                {formatDate(session.started)}
              </span>
              <span>
                <span className='font-medium text-foreground/70'>Last access:</span>{' '}
                {formatDate(session.lastAccess)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: sign-out button */}
        {!session.current && (
          <Button
            variant='outline'
            size='sm'
            className='shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground'
            disabled={signingOut}
            onClick={() => onSignOut(session.id)}
          >
            {signingOut ? (
              <IconLoader2 size={14} className='animate-spin' />
            ) : (
              <IconLogout size={14} />
            )}
            <span className='ml-1 hidden sm:inline'>Sign out</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export default function SettingsSessions() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [signingOutId, setSigningOutId] = useState<string | null>(null)
  const [signingOutAll, setSigningOutAll] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchMySessions()
      // current session first, then sorted by lastAccess desc
      setSessions(
        [...data].sort((a, b) => {
          if (a.current) return -1
          if (b.current) return 1
          return new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime()
        }),
      )
    } catch {
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSignOut = async (sessionId: string) => {
    setSigningOutId(sessionId)
    try {
      await signOutSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast.success('Session signed out')
    } catch {
      toast.error('Failed to sign out session')
    } finally {
      setSigningOutId(null)
    }
  }

  const handleSignOutAll = async () => {
    if (!window.confirm('Sign out all other devices? You will stay logged in on this device.')) return
    setSigningOutAll(true)
    try {
      await signOutAllDevices()
      toast.success('Signed out from all devices')
      await load()
    } catch {
      toast.error('Failed to sign out all devices')
    } finally {
      setSigningOutAll(false)
    }
  }

  const otherCount = sessions.filter((s) => !s.current).length

  return (
    <div className='flex flex-1 flex-col'>
      {/* Header */}
      <div className='flex-none'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h3 className='flex items-center gap-2 text-lg font-medium'>
              <IconShieldLock size={20} />
              Active Sessions
            </h3>
            <p className='text-sm text-muted-foreground'>
              View and manage all devices currently signed in to your account.
            </p>
          </div>

          <div className='flex shrink-0 gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={load}
              disabled={loading}
              title='Refresh'
            >
              <IconRefresh size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
            {otherCount > 0 && (
              <Button
                variant='destructive'
                size='sm'
                onClick={handleSignOutAll}
                loading={signingOutAll}
              >
                <IconLogout size={14} className='mr-1' />
                Sign out all devices
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator className='my-4 flex-none' />

      {/* Session list */}
      <div className='faded-bottom -mx-4 flex-1 overflow-auto scroll-smooth px-4 md:pb-16'>
        {loading ? (
          <div className='flex items-center justify-center py-12 text-muted-foreground'>
            <IconLoader2 size={20} className='animate-spin' />
            <span className='ml-2 text-sm'>Loading sessions…</span>
          </div>
        ) : sessions.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>No active sessions found.</p>
        ) : (
          <div className='space-y-3 lg:max-w-2xl'>
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onSignOut={handleSignOut}
                signingOut={signingOutId === session.id}
              />
            ))}
            <p className='pt-1 text-xs text-muted-foreground'>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
              {otherCount > 0 && ` · ${otherCount} other device${otherCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
