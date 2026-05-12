'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import dayjs from 'dayjs';
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { getUserIdFromAccessToken } from '@/features/auth/utils/auth-session';
import {
  fetchConversations,
  fetchMessages,
  markDelivered,
  markSeen,
  sendMessage,
} from '@/features/chat/services/chat-api';
import type { ChatMessage, Conversation } from '@/features/chat/types';

const PRIORITY_PREFIX = '[PRIORITY]';
const MESSAGE_PAGE_SIZE = 30;
const AUTO_SCROLL_THRESHOLD = 120;
const MENTION_CANDIDATES = [
  { id: 'support-01', handle: 'linh.tran', name: 'Linh Tran' },
  { id: 'support-02', handle: 'minh.nguyen', name: 'Minh Nguyen' },
  { id: 'support-03', handle: 'huy.vo', name: 'Huy Vo' },
  { id: 'support-04', handle: 'thao.le', name: 'Thao Le' },
  { id: 'support-05', handle: 'nhi.pham', name: 'Nhi Pham' },
];

type MentionState = {
  query: string;
  startIndex: number;
};

function resolveWsUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_WS_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const trimmed = base?.replace(/\/$/, '') || 'http://localhost:8000';
  return `${trimmed}/ws/chat`;
}

function parsePriority(content: string): { text: string; priority: boolean } {
  if (!content) return { text: '', priority: false };
  if (content.startsWith(PRIORITY_PREFIX)) {
    return { text: content.replace(PRIORITY_PREFIX, '').trimStart(), priority: true };
  }
  return { text: content, priority: false };
}

function formatForSend(content: string, priority: boolean): string {
  if (!priority) return content;
  return `${PRIORITY_PREFIX} ${content}`.trim();
}

function formatTimestamp(value?: string | null): string {
  if (!value) return '';
  return dayjs(value).format('HH:mm');
}

function statusLabel(status: ChatMessage['status']): string {
  if (status === 'SEEN') return 'Seen';
  if (status === 'DELIVERED') return 'Delivered';
  return 'Sent';
}

function renderMessageText(text: string) {
  const parts = text.split(/(\s+)/);
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span
          key={`${part}-${index}`}
          className="font-semibold text-emerald-600"
        >
          {part}
        </span>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [priorityEnabled, setPriorityEnabled] = useState(false);
  const [typingActive, setTypingActive] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Record<string, StompSubscription>>({});
  const typingSubscriptionRef = useRef<StompSubscription | null>(null);

  const wsUrl = useMemo(() => resolveWsUrl(), []);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId],
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const label = conversation.otherUserId || conversation.customerId || '';
      const preview = conversation.lastMessage?.preview || '';
      return (
        label.toLowerCase().includes(query) || preview.toLowerCase().includes(query)
      );
    });
  }, [conversations, searchQuery]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations],
  );

  const mentionState: MentionState | null = useMemo(() => {
    const slice = inputValue.slice(0, cursorPosition);
    const atIndex = slice.lastIndexOf('@');
    if (atIndex < 0) return null;
    if (atIndex > 0 && !/\s/.test(slice[atIndex - 1])) return null;
    const query = slice.slice(atIndex + 1);
    if (query.includes(' ')) return null;
    return { query, startIndex: atIndex };
  }, [inputValue, cursorPosition]);

  const mentionMatches = useMemo(() => {
    if (!mentionState) return [];
    const keyword = mentionState.query.toLowerCase();
    return MENTION_CANDIDATES.filter((candidate) => {
      return (
        candidate.handle.toLowerCase().includes(keyword) ||
        candidate.name.toLowerCase().includes(keyword)
      );
    }).slice(0, 5);
  }, [mentionState]);

  const mentionOpen = mentionMatches.length > 0;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior,
    });
  }, []);

  const updateCursorPosition = useCallback(() => {
    if (!inputRef.current) return;
    setCursorPosition(inputRef.current.selectionStart || 0);
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const page = await fetchConversations(0, 30);
      const hydrated = page.content.map((conversation) => ({
        ...conversation,
        unreadCount: conversation.unreadCount || 0,
      }));
      setConversations(hydrated);
      if (!activeConversationId && hydrated.length > 0) {
        setActiveConversationId(hydrated[0].id);
      }
    } catch {
      // Silent fail: keep widget usable even if API is unavailable.
    }
  }, [activeConversationId]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      try {
        const payload = await fetchMessages(conversationId, undefined, MESSAGE_PAGE_SIZE);
        const ordered = [...payload.content].reverse();
        setMessages(ordered);
        setNextCursor(payload.nextCursor);
        setHasMore(payload.hasMore);
        setAutoScrollEnabled(true);
        setTimeout(() => scrollToBottom('auto'), 0);
      } catch {
        setMessages([]);
        setNextCursor(undefined);
        setHasMore(false);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [scrollToBottom],
  );

  const loadOlderMessages = useCallback(async () => {
    if (!activeConversationId || !hasMore || isLoadingOlder) return;
    setIsLoadingOlder(true);
    const previousHeight = listRef.current?.scrollHeight || 0;
    try {
      const payload = await fetchMessages(activeConversationId, nextCursor, MESSAGE_PAGE_SIZE);
      const ordered = [...payload.content].reverse();
      setMessages((prev) => [...ordered, ...prev]);
      setNextCursor(payload.nextCursor);
      setHasMore(payload.hasMore);
      setTimeout(() => {
        if (!listRef.current) return;
        const newHeight = listRef.current.scrollHeight || 0;
        listRef.current.scrollTop = newHeight - previousHeight;
      }, 0);
    } catch {
      // ignore
    } finally {
      setIsLoadingOlder(false);
    }
  }, [activeConversationId, hasMore, isLoadingOlder, nextCursor]);

  const upsertMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const index = prev.findIndex((item) => item.id === message.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = message;
        return updated;
      }
      return [...prev, message];
    });
  }, []);

  const updateConversationPreview = useCallback(
    (message: ChatMessage) => {
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== message.conversationId) return conversation;
          const parsed = parsePriority(message.content);
          return {
            ...conversation,
            lastMessage: {
              id: message.id,
              senderId: message.senderId,
              preview: parsed.text,
              sentAt: message.createdAt,
            },
          };
        }),
      );
    },
    [],
  );

  const handleIncomingMessage = useCallback(
    (payload: ChatMessage) => {
      updateConversationPreview(payload);
      if (payload.conversationId === activeConversationId) {
        upsertMessage(payload);
        if (autoScrollEnabled) {
          setTimeout(() => scrollToBottom('smooth'), 0);
        }
      } else if (payload.senderId !== userId) {
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === payload.conversationId
              ? { ...conversation, unreadCount: (conversation.unreadCount || 0) + 1 }
              : conversation,
          ),
        );
      }

      if (payload.senderId !== userId && payload.recipientId === userId) {
        markDelivered(payload.conversationId, payload.id).catch(() => undefined);
        if (payload.conversationId === activeConversationId && autoScrollEnabled) {
          markSeen(payload.conversationId, payload.id).catch(() => undefined);
        }
      }
    },
    [activeConversationId, autoScrollEnabled, scrollToBottom, updateConversationPreview, upsertMessage, userId],
  );

  const ensureSubscriptions = useCallback(() => {
    if (!clientRef.current || !connected) return;
    const client = clientRef.current;
    conversations.forEach((conversation) => {
      if (subscriptionsRef.current[conversation.id]) return;
      subscriptionsRef.current[conversation.id] = client.subscribe(
        `/topic/conversations/${conversation.id}/messages`,
        (message) => {
          try {
            const payload = JSON.parse(message.body) as ChatMessage;
            handleIncomingMessage(payload);
          } catch {
            // ignore malformed payload
          }
        },
      );
    });
  }, [connected, conversations, handleIncomingMessage]);

  const connectSocket = useCallback(() => {
    if (clientRef.current) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: userId ? { 'X-User-Id': userId } : undefined,
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
    });
    client.activate();
    clientRef.current = client;
  }, [userId, wsUrl]);

  const disconnectSocket = useCallback(() => {
    if (!clientRef.current) return;
    clientRef.current.deactivate();
    clientRef.current = null;
    setConnected(false);
    subscriptionsRef.current = {};
  }, []);

  const subscribeTyping = useCallback(() => {
    if (!clientRef.current || !connected || !activeConversationId) return;
    if (typingSubscriptionRef.current) {
      typingSubscriptionRef.current.unsubscribe();
      typingSubscriptionRef.current = null;
    }
    typingSubscriptionRef.current = clientRef.current.subscribe(
      `/topic/conversations/${activeConversationId}/typing`,
      (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body) as { typing?: boolean; userId?: string };
          if (payload.userId && payload.userId === userId) return;
          setTypingActive(Boolean(payload.typing));
        } catch {
          // ignore
        }
      },
    );
  }, [activeConversationId, connected, userId]);

  const emitTyping = useCallback(
    (typing: boolean) => {
      if (!clientRef.current || !connected || !activeConversationId) return;
      clientRef.current.publish({
        destination: `/app/conversations/${activeConversationId}/typing`,
        body: JSON.stringify({ typing }),
        headers: userId ? { 'X-User-Id': userId } : undefined,
      });
    },
    [activeConversationId, connected, userId],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      updateCursorPosition();
      if (!typingTimeoutRef.current) {
        emitTyping(true);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
        typingTimeoutRef.current = null;
      }, 1000);
    },
    [emitTyping, updateCursorPosition],
  );

  const applyMention = useCallback(
    (handle: string) => {
      if (!mentionState) return;
      const before = inputValue.slice(0, mentionState.startIndex);
      const after = inputValue.slice(cursorPosition);
      const insert = `@${handle} `;
      const nextValue = `${before}${insert}${after}`;
      setInputValue(nextValue);
      setTimeout(() => {
        if (!inputRef.current) return;
        const nextCursor = (before + insert).length;
        inputRef.current.setSelectionRange(nextCursor, nextCursor);
        setCursorPosition(nextCursor);
      }, 0);
      setMentionIndex(0);
    },
    [cursorPosition, inputValue, mentionState],
  );

  const handleSend = useCallback(async () => {
    if (!activeConversationId) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const outgoingContent = formatForSend(trimmed, priorityEnabled);
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversationId,
      senderId: userId || 'self',
      recipientId: activeConversation?.otherUserId || '',
      content: outgoingContent,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      seenAt: null,
    };

    setMessages((prev) => [...prev, optimistic]);
    updateConversationPreview(optimistic);
    setInputValue('');
    setPriorityEnabled(false);
    setTimeout(() => scrollToBottom('smooth'), 0);

    try {
      const saved = await sendMessage(activeConversationId, outgoingContent);
      setMessages((prev) => prev.map((item) => (item.id === optimistic.id ? saved : item)));
      updateConversationPreview(saved);
    } catch {
      setMessages((prev) => prev.filter((item) => item.id !== optimistic.id));
    }
  }, [
    activeConversation,
    activeConversationId,
    inputValue,
    priorityEnabled,
    scrollToBottom,
    updateConversationPreview,
    userId,
  ]);

  useEffect(() => {
    const token = authStorage.getAccessToken();
    setUserId(getUserIdFromAccessToken(token));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadConversations();
  }, [isOpen, loadConversations]);

  useEffect(() => {
    if (!activeConversationId) return;
    loadMessages(activeConversationId);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket]);

  useEffect(() => {
    if (!connected) return;
    ensureSubscriptions();
  }, [connected, ensureSubscriptions]);

  useEffect(() => {
    subscribeTyping();
  }, [subscribeTyping]);

  useEffect(() => {
    if (!autoScrollEnabled) return;
    scrollToBottom('smooth');
  }, [messages, autoScrollEnabled, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < AUTO_SCROLL_THRESHOLD;
    setAutoScrollEnabled(nearBottom);
    if (scrollTop < 80 && hasMore) {
      loadOlderMessages();
    }
  }, [hasMore, loadOlderMessages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5"
        >
          <MessageCircle className="h-4 w-4" />
          Chat support
          {totalUnread > 0 && (
            <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white shadow">
              {totalUnread}
            </span>
          )}
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_60%)] opacity-0 transition group-hover:opacity-100" />
        </button>
      )}

      {isOpen && (
        <div className="relative h-[80vh] w-[92vw] max-w-[980px] overflow-hidden rounded-[28px] border border-border bg-bg-elevated/90 shadow-[0_30px_70px_rgba(15,23,42,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 md:h-[720px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.18),transparent_55%)]" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Support desk
                  </p>
                  <h3 className="text-lg font-semibold text-text-primary">NexaTech Live Chat</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 md:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {connected ? 'Online' : 'Offline'}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex h-full flex-1 flex-col overflow-hidden md:flex-row">
              <aside className="w-full border-b border-border/60 bg-bg-sunken/60 md:w-72 md:border-b-0 md:border-r">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search conversations"
                      className="h-10 w-full rounded-xl border border-border bg-bg-elevated pl-10 pr-3 text-sm text-text-primary shadow-sm outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
                <div className="flex h-56 flex-col gap-2 overflow-y-auto px-3 pb-3 md:h-full">
                  {filteredConversations.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border/70 bg-bg-elevated/60 p-4 text-xs text-text-tertiary">
                      No conversations yet.
                    </div>
                  )}
                  {filteredConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversationId;
                    const displayId = conversation.otherUserId || conversation.customerId || 'Unknown';
                    const preview = conversation.lastMessage?.preview || 'No messages yet';
                    const { priority } = parsePriority(preview);
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setActiveConversationId(conversation.id)}
                        className={`flex flex-col gap-1 rounded-2xl border px-3 py-2 text-left transition ${
                          isActive
                            ? 'border-emerald-400/60 bg-white/80 shadow-sm'
                            : 'border-transparent hover:border-border/70 hover:bg-bg-elevated/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-text-primary">
                            Customer {displayId.slice(0, 8)}
                          </span>
                          <div className="flex items-center gap-2">
                            {priority && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.6rem] font-semibold text-amber-700">
                                Priority
                              </span>
                            )}
                            {conversation.unreadCount ? (
                              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-emerald-500 text-[0.65rem] font-bold text-white">
                                {conversation.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className="line-clamp-1 text-xs text-text-tertiary">{preview}</p>
                        <div className="flex items-center justify-between text-[0.65rem] text-text-tertiary">
                          <span className="flex items-center gap-1">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                conversation.otherUserOnline ? 'bg-emerald-500' : 'bg-gray-300'
                              }`}
                            />
                            {conversation.otherUserOnline ? 'Online' : 'Away'}
                          </span>
                          <span>
                            {conversation.lastMessage?.sentAt
                              ? formatTimestamp(conversation.lastMessage.sentAt)
                              : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="flex h-full flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                      Conversation
                    </p>
                    <h4 className="text-base font-semibold text-text-primary">
                      {activeConversation
                        ? `Customer ${(
                            activeConversation.otherUserId ||
                            activeConversation.customerId
                          ).slice(0, 8)}`
                        : 'Select a conversation'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    {activeConversation?.otherUserOnline ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Online
                      </span>
                    ) : (
                      <span className="rounded-full border border-border px-2 py-1">Offline</span>
                    )}
                  </div>
                </div>

                <div
                  ref={listRef}
                  onScroll={handleScroll}
                  className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
                >
                  {isLoadingMessages && (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-bg-elevated/60 p-4 text-center text-xs text-text-tertiary">
                      Loading messages...
                    </div>
                  )}

                  {hasMore && !isLoadingOlder && (
                    <button
                      type="button"
                      onClick={loadOlderMessages}
                      className="mx-auto flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-text-tertiary"
                    >
                      <ChevronUp className="h-3 w-3" />
                      Load older messages
                    </button>
                  )}

                  {messages.map((message) => {
                    const isMine = message.senderId === userId;
                    const { text, priority } = parsePriority(message.content);
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                            isMine
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                              : 'bg-white text-text-primary'
                          }`}
                        >
                          {priority && (
                            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[0.65rem] font-semibold text-amber-700">
                              <Star className="h-3 w-3" />
                              Priority
                            </span>
                          )}
                          <p className="leading-relaxed">{renderMessageText(text)}</p>
                          <div className="mt-2 flex items-center justify-between text-[0.65rem] text-white/80">
                            <span className={isMine ? 'text-white/80' : 'text-text-tertiary'}>
                              {formatTimestamp(message.createdAt)}
                            </span>
                            {isMine && (
                              <span className="text-white/80">{statusLabel(message.status)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {typingActive && (
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <span className="flex h-6 items-center gap-1 rounded-full bg-bg-sunken px-3">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:240ms]" />
                      </span>
                      Typing...
                    </div>
                  )}
                </div>

                <div className="border-t border-border/70 bg-bg-elevated/80 p-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPriorityEnabled((prev) => !prev)}
                      className={`flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold ${
                        priorityEnabled
                          ? 'border-amber-500/60 bg-amber-500/10 text-amber-700'
                          : 'border-border text-text-tertiary'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Priority
                    </button>
                    <div className="relative flex-1">
                      {mentionOpen && (
                        <div className="absolute -top-2 left-0 z-10 w-full -translate-y-full rounded-2xl border border-border bg-white p-2 shadow-lg">
                          {mentionMatches.map((mention, index) => (
                            <button
                              key={mention.id}
                              type="button"
                              onClick={() => applyMention(mention.handle)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm ${
                                index === mentionIndex
                                  ? 'bg-emerald-500/10 text-emerald-700'
                                  : 'text-text-primary hover:bg-bg-sunken'
                              }`}
                            >
                              <span className="font-semibold">@{mention.handle}</span>
                              <span className="text-xs text-text-tertiary">{mention.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(event) => handleInputChange(event.target.value)}
                        onKeyUp={updateCursorPosition}
                        onClick={updateCursorPosition}
                        onKeyDown={(event) => {
                          if (mentionOpen) {
                            if (event.key === 'ArrowDown') {
                              event.preventDefault();
                              setMentionIndex((prev) => (prev + 1) % mentionMatches.length);
                              return;
                            }
                            if (event.key === 'ArrowUp') {
                              event.preventDefault();
                              setMentionIndex((prev) =>
                                prev === 0 ? mentionMatches.length - 1 : prev - 1,
                              );
                              return;
                            }
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              applyMention(mentionMatches[mentionIndex].handle);
                              return;
                            }
                            if (event.key === 'Escape') {
                              event.preventDefault();
                              setMentionIndex(0);
                            }
                          }
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                          }
                        }}
                        onBlur={() => emitTyping(false)}
                        placeholder="Type your message, use @ to mention..."
                        rows={1}
                        className="min-h-[44px] w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary shadow-sm outline-none focus:border-emerald-400"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      className="h-11 w-11 rounded-2xl"
                      onClick={handleSend}
                      disabled={!activeConversationId || !inputValue.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[0.65rem] text-text-tertiary">
                    <span>Press Enter to send, Shift+Enter for a new line.</span>
                    <span className="flex items-center gap-1">
                      <ChevronDown className="h-3 w-3" />
                      {inputValue.length}/2000
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
