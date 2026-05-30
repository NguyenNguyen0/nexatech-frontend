import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconChevronDown } from '@tabler/icons-react'
import { Button, buttonVariants } from './custom/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { cn } from '@/lib/utils'
import useCheckActiveNav from '@/hooks/use-check-active-nav'
import { SideLink } from '@/data/sidelinks'
import { fetchConversations, isChatServiceUnavailable } from '@/pages/admin/chats/chat-api'

const CHAT_ROUTE = '/admin/chats'
const CHAT_UNREAD_CHANGED_EVENT = 'admin-chat-unread-changed'
const CHAT_UNREAD_POLL_INTERVAL_MS = 15000
const CHAT_UNREAD_FAILURE_PAUSE_MS = 5 * 60 * 1000

type ChatUnreadChangedEvent = CustomEvent<{ hasUnread: boolean }>

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  links: SideLink[]
  closeNav: () => void
}

export default function Nav({
  links,
  isCollapsed,
  className,
  closeNav,
}: NavProps) {
  const hasUnreadChat = useChatUnreadBadge()

  const renderLink = ({ sub, ...rest }: SideLink) => {
    const key = `${rest.title}-${rest.href}`
    const hasUnreadBadge = rest.href === CHAT_ROUTE && hasUnreadChat

    if (isCollapsed && sub)
      return (
        <NavLinkIconDropdown
          {...rest}
          sub={sub}
          key={key}
          closeNav={closeNav}
          hasUnreadBadge={hasUnreadBadge}
        />
      )

    if (isCollapsed)
      return <NavLinkIcon {...rest} key={key} closeNav={closeNav} hasUnreadBadge={hasUnreadBadge} />

    if (sub)
      return (
        <NavLinkDropdown {...rest} sub={sub} key={key} closeNav={closeNav} hasUnreadBadge={hasUnreadBadge} />
      )

    return <NavLink {...rest} key={key} closeNav={closeNav} hasUnreadBadge={hasUnreadBadge} />
  }
  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        'group border-b bg-background py-2 transition-[max-height,padding] duration-500 data-[collapsed=true]:py-2 md:border-none',
        className
      )}
    >
      <TooltipProvider delayDuration={0}>
        <nav className='grid gap-1 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2'>
          {links.map(renderLink)}
        </nav>
      </TooltipProvider>
    </div>
  )
}

interface NavLinkProps extends SideLink {
  subLink?: boolean
  closeNav: () => void
  hasUnreadBadge?: boolean
}

function NavLink({
  title,
  icon,
  label,
  href,
  closeNav,
  hasUnreadBadge = false,
  subLink = false,
}: NavLinkProps) {
  const { checkActiveNav } = useCheckActiveNav()
  return (
    <Link
      to={href}
      onClick={closeNav}
      className={cn(
        buttonVariants({
          variant: checkActiveNav(href) ? 'secondary' : 'ghost',
          size: 'sm',
        }),
        'h-12 justify-start text-wrap rounded-none px-6',
        subLink && 'h-10 w-full border-l border-l-slate-500 px-2'
      )}
      aria-current={checkActiveNav(href) ? 'page' : undefined}
    >
      <div className='mr-2'>{icon}</div>
      <span className='truncate'>{title}</span>
      {hasUnreadBadge && <ChatUnreadDot className='ml-auto' />}
      {label && (
        <div className='ml-2 rounded-lg bg-primary px-1 text-[0.625rem] text-primary-foreground'>
          {label}
        </div>
      )}
    </Link>
  )
}

function NavLinkDropdown({ title, icon, label, sub, closeNav, hasUnreadBadge = false }: NavLinkProps) {
  const { checkActiveNav } = useCheckActiveNav()

  /* Open collapsible by default
   * if one of child element is active */
  const isChildActive = !!sub?.find((s) => checkActiveNav(s.href))

  return (
    <Collapsible defaultOpen={isChildActive}>
      <CollapsibleTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'group h-12 w-full justify-start rounded-none px-6'
        )}
      >
        <div className='mr-2'>{icon}</div>
        {title}
        {hasUnreadBadge && <ChatUnreadDot className='ml-auto' />}
        {label && (
          <div className='ml-2 rounded-lg bg-primary px-1 text-[0.625rem] text-primary-foreground'>
            {label}
          </div>
        )}
        <span
          className={cn(
            hasUnreadBadge ? 'ml-2 transition-all group-data-[state="open"]:-rotate-180' : 'ml-auto transition-all group-data-[state="open"]:-rotate-180'
          )}
        >
          <IconChevronDown stroke={1} />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className='collapsibleDropdown' asChild>
        <ul>
          {sub!.map((sublink) => (
            <li key={sublink.title} className='my-1 ml-8'>
              <NavLink {...sublink} subLink closeNav={closeNav} />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

function NavLinkIcon({ title, icon, label, href, hasUnreadBadge = false }: NavLinkProps) {
  const { checkActiveNav } = useCheckActiveNav()
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          to={href}
          className={cn(
            buttonVariants({
              variant: checkActiveNav(href) ? 'secondary' : 'ghost',
              size: 'icon',
            }),
            'h-12 w-12'
          )}
        >
          <span className='relative'>
            {icon}
            {hasUnreadBadge && <ChatUnreadDot />}
          </span>
          <span className='sr-only'>{title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side='right' className='flex items-center gap-4'>
        {title}
        {hasUnreadBadge && <ChatUnreadDot />}
        {label && (
          <span className='ml-auto text-muted-foreground'>{label}</span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

function NavLinkIconDropdown({ title, icon, label, sub, hasUnreadBadge = false }: NavLinkProps) {
  const { checkActiveNav } = useCheckActiveNav()

  /* Open collapsible by default
   * if one of child element is active */
  const isChildActive = !!sub?.find((s) => checkActiveNav(s.href))

  return (
    <DropdownMenu>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isChildActive ? 'secondary' : 'ghost'}
              size='icon'
              className='h-12 w-12'
            >
              <span className='relative'>
                {icon}
                {hasUnreadBadge && <ChatUnreadDot />}
              </span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side='right' className='flex items-center gap-4'>
          {title}{' '}
          {hasUnreadBadge && <ChatUnreadDot />}
          {label && (
            <span className='ml-auto text-muted-foreground'>{label}</span>
          )}
          <IconChevronDown
            size={18}
            className='-rotate-90 text-muted-foreground'
          />
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent side='right' align='start' sideOffset={4}>
        <DropdownMenuLabel>
          {title} {label ? `(${label})` : ''}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sub!.map(({ title, icon, label, href }) => (
          <DropdownMenuItem key={`${title}-${href}`} asChild>
            <Link
              to={href}
              className={`${checkActiveNav(href) ? 'bg-secondary' : ''}`}
            >
              {icon} <span className='ml-2 max-w-52 text-wrap'>{title}</span>
              {label && <span className='ml-auto text-xs'>{label}</span>}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function useChatUnreadBadge(): boolean {
  const [hasUnreadChat, setHasUnreadChat] = useState(false)
  const retryAfterRef = useRef(0)
  const shouldPollChat = typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/agent')

  const refresh = useCallback(async () => {
    if (!shouldPollChat) return
    if (Date.now() < retryAfterRef.current) return

    try {
      const page = await fetchConversations(0, 100)
      retryAfterRef.current = 0
      setHasUnreadChat(page.content.some((conversation) => (conversation.unreadCount ?? 0) > 0))
    } catch (error) {
      if (isChatServiceUnavailable(error)) {
        retryAfterRef.current = Date.now() + CHAT_UNREAD_FAILURE_PAUSE_MS
      }
      // Keep the last known badge state if chat-service is temporarily unavailable.
    }
  }, [shouldPollChat])

  useEffect(() => {
    if (!shouldPollChat) return
    void refresh()

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, CHAT_UNREAD_POLL_INTERVAL_MS)

    const handleUnreadChanged = (event: Event) => {
      const unreadEvent = event as ChatUnreadChangedEvent
      setHasUnreadChat(Boolean(unreadEvent.detail?.hasUnread))
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refresh()
    }

    window.addEventListener(CHAT_UNREAD_CHANGED_EVENT, handleUnreadChanged)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener(CHAT_UNREAD_CHANGED_EVENT, handleUnreadChanged)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refresh, shouldPollChat])

  return hasUnreadChat
}

function ChatUnreadDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden='true'
      className={cn('block size-2 rounded-full bg-red-500 ring-2 ring-background', className ?? 'absolute -right-1 -top-1')}
    />
  )
}
