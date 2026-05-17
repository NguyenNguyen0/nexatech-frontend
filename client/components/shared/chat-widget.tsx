'use client';

import { Client, type StompSubscription } from '@stomp/stompjs';
import dayjs from 'dayjs';
import { MessageCircle, Minus, Send, X } from 'lucide-react';
import SockJS from 'sockjs-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authStorage } from '@/features/auth/utils/auth-storage';
import {
  getRolesFromAccessToken,
  getUserIdFromAccessToken,
  pickPrimaryRole,
} from '@/features/auth/utils/auth-session';
import {
  createOrGetCurrentConversation,
  fetchConversations,
  fetchCurrentConversation,
  fetchMessages,
  markDelivered,
  markSeen,
  sendMessage,
} from '@/features/chat/services/chat-api';
import type { ChatMessage, Conversation } from '@/features/chat/types';
import { getOrCreateGuestChatSessionId } from '@/features/chat/utils/guest-chat-session';

const MESSAGE_PAGE_SIZE = 30;
const AUTO_SCROLL_THRESHOLD = 80;

type WidgetState = 'closed' | 'minimized' | 'open';

function resolveWsUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_WS_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const trimmed = base?.replace(/\/$/, '') || 'http://localhost:8000';
  return `${trimmed}/ws/chat`;
}

function formatTimestamp(value?: string | null): string {
  if (!value) return '';
  return dayjs(value).format('HH:mm');
}

function statusLabel(status: ChatMessage['status']): string {
  if (status === 'SEEN') return 'Đã xem';
  if (status === 'DELIVERED') return 'Đã nhận';
  return 'Đã gửi';
}

export function ChatWidget() {
  const [widgetState, setWidgetState] = useState<WidgetState>('closed');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  const [identityReady, setIdentityReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Record<string, StompSubscription>>({});

  const isOpen = widgetState === 'open';
  const wsUrl = useMemo(() => resolveWsUrl(), []);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  const currentParticipantId = activeConversation?.currentParticipantId ?? userId;

  const totalUnread = useMemo(
    () => conversations.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0),
    [conversations],
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior,
    });
  }, []);

  const hydrateConversation = useCallback(
    (conversation: Conversation): Conversation => ({
      ...conversation,
      unreadCount: conversation.unreadCount ?? 0,
    }),
    [],
  );

  const upsertConversation = useCallback(
    (conversation: Conversation) => {
      const hydrated = hydrateConversation(conversation);
      setConversations((current) => {
        const existingIndex = current.findIndex((item) => item.id === hydrated.id);
        if (existingIndex < 0) return [hydrated, ...current];

        const updated = [...current];
        updated[existingIndex] = { ...updated[existingIndex], ...hydrated };
        return updated;
      });
      setActiveConversationId((current) => current ?? hydrated.id);
      return hydrated;
    },
    [hydrateConversation],
  );

  const loadInitialConversations = useCallback(async () => {
    if (!identityReady) return;

    if (userId) {
      try {
        const page = await fetchConversations(0, 10);
        const hydrated = page.content.map(hydrateConversation);
        setConversations(hydrated);
        setActiveConversationId((current) => current ?? hydrated[0]?.id ?? null);
      } catch {
        setConversations([]);
      }
      return;
    }

    if (!guestSessionId) return;

    try {
      const currentConversation = await fetchCurrentConversation({ guestSessionId });
      const hydrated = hydrateConversation(currentConversation);
      setConversations([hydrated]);
      setActiveConversationId(hydrated.id);
    } catch {
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [guestSessionId, hydrateConversation, identityReady, userId]);

  const ensureCurrentConversation = useCallback(async (): Promise<Conversation | null> => {
    if (activeConversation) return activeConversation;
    if (!identityReady) return null;
    if (!userId && !guestSessionId) return null;

    try {
      const conversation = await createOrGetCurrentConversation({ guestSessionId });
      return upsertConversation(conversation);
    } catch {
      return null;
    }
  }, [activeConversation, guestSessionId, identityReady, upsertConversation, userId]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      try {
        const payload = await fetchMessages(conversationId, undefined, MESSAGE_PAGE_SIZE, {
          guestSessionId,
        });
        const ordered = [...payload.content].reverse();
        setMessages(ordered);
        setAutoScrollEnabled(true);
        setTimeout(() => scrollToBottom('auto'), 0);
      } catch {
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [guestSessionId, scrollToBottom],
  );

  const upsertMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => {
      const existingIndex = current.findIndex((item) => item.id === message.id);
      if (existingIndex < 0) return [...current, message];

      const updated = [...current];
      updated[existingIndex] = message;
      return updated;
    });
  }, []);

  const updateConversationPreview = useCallback((message: ChatMessage) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === message.conversationId
          ? {
              ...conversation,
              lastMessage: {
                id: message.id,
                senderId: message.senderId,
                preview: message.content,
                sentAt: message.createdAt,
              },
            }
          : conversation,
      ),
    );
  }, []);

  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      updateConversationPreview(message);

      if (message.conversationId === activeConversationId) {
        upsertMessage(message);
        if (isOpen && autoScrollEnabled) {
          setTimeout(() => scrollToBottom('smooth'), 0);
        }
      }

      if (message.senderId !== currentParticipantId) {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  unreadCount:
                    message.conversationId === activeConversationId && isOpen
                      ? 0
                      : (conversation.unreadCount ?? 0) + 1,
                }
              : conversation,
          ),
        );
      }

      if (message.senderId !== currentParticipantId && message.recipientId === currentParticipantId) {
        markDelivered(message.conversationId, message.id, { guestSessionId }).catch(() => undefined);
        if (message.conversationId === activeConversationId && isOpen) {
          markSeen(message.conversationId, message.id, { guestSessionId }).catch(() => undefined);
        }
      }
    },
    [
      activeConversationId,
      autoScrollEnabled,
      currentParticipantId,
      guestSessionId,
      isOpen,
      scrollToBottom,
      updateConversationPreview,
      upsertMessage,
    ],
  );

  const ensureSubscriptions = useCallback(() => {
    if (!clientRef.current || !connected) return;

    conversations.forEach((conversation) => {
      if (subscriptionsRef.current[conversation.id]) return;

      subscriptionsRef.current[conversation.id] = clientRef.current!.subscribe(
        `/topic/conversations/${conversation.id}/messages`,
        (message) => {
          try {
            handleIncomingMessage(JSON.parse(message.body) as ChatMessage);
          } catch {
            // Ignore malformed websocket payloads.
          }
        },
      );
    });
  }, [connected, conversations, handleIncomingMessage]);

  const connectSocket = useCallback(() => {
    if (clientRef.current) return;

    const connectHeaders: Record<string, string> = {};
    if (userId) connectHeaders['X-User-Id'] = userId;
    if (userRole) connectHeaders['X-User-Role'] = userRole;
    if (!userId && guestSessionId) connectHeaders['X-Guest-Session-Id'] = guestSessionId;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders,
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;
  }, [guestSessionId, userId, userRole, wsUrl]);

  const disconnectSocket = useCallback(() => {
    if (!clientRef.current) return;
    clientRef.current.deactivate();
    clientRef.current = null;
    subscriptionsRef.current = {};
    setConnected(false);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const conversation = activeConversation ?? (await ensureCurrentConversation());
    if (!conversation) return;

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversation.id,
      senderId: conversation.currentParticipantId,
      recipientId: conversation.otherUserId ?? null,
      content: trimmed,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      seenAt: null,
    };

    setMessages((current) => [...current, optimisticMessage]);
    updateConversationPreview(optimisticMessage);
    setInputValue('');
    setTimeout(() => scrollToBottom('smooth'), 0);

    try {
      const saved = await sendMessage(conversation.id, trimmed, { guestSessionId });
      setMessages((current) =>
        current.map((message) => (message.id === optimisticMessage.id ? saved : message)),
      );
      updateConversationPreview(saved);

      if (conversation.status === 'WAITING') {
        try {
          upsertConversation(await fetchCurrentConversation({ guestSessionId }));
        } catch {
          // Keep the existing conversation state if the refresh fails.
        }
      }
    } catch {
      setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
    }
  }, [
    activeConversation,
    ensureCurrentConversation,
    guestSessionId,
    inputValue,
    scrollToBottom,
    updateConversationPreview,
    upsertConversation,
  ]);

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < AUTO_SCROLL_THRESHOLD;
    setAutoScrollEnabled(nearBottom);
  }, []);

  useEffect(() => {
    const token = authStorage.getAccessToken();
    const resolvedUserId = getUserIdFromAccessToken(token);
    setUserId(resolvedUserId);
    setUserRole(pickPrimaryRole(getRolesFromAccessToken(token)));
    if (!resolvedUserId) {
      setGuestSessionId(getOrCreateGuestChatSessionId());
    }
    setIdentityReady(true);
  }, []);

  useEffect(() => {
    void loadInitialConversations();
  }, [loadInitialConversations]);

  useEffect(() => {
    if (!activeConversationId) return;
    void loadMessages(activeConversationId);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    if (!identityReady || (!userId && !guestSessionId)) return;
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket, guestSessionId, identityReady, userId]);

  useEffect(() => {
    if (!connected) return;
    ensureSubscriptions();
  }, [connected, ensureSubscriptions]);

  useEffect(() => {
    if (!isOpen || activeConversationId || !identityReady) return;
    void ensureCurrentConversation();
  }, [activeConversationId, ensureCurrentConversation, identityReady, isOpen]);

  useEffect(() => {
    if (!autoScrollEnabled) return;
    scrollToBottom('smooth');
  }, [autoScrollEnabled, messages, scrollToBottom]);

  useEffect(() => {
    if (!isOpen || !activeConversationId || messages.length === 0) return;
    const latestIncoming = [...messages]
      .reverse()
      .find(
        (message) =>
          message.senderId !== currentParticipantId &&
          message.recipientId === currentParticipantId,
      );
    if (!latestIncoming) return;
    markSeen(activeConversationId, latestIncoming.id, { guestSessionId }).catch(() => undefined);
  }, [activeConversationId, currentParticipantId, guestSessionId, isOpen, messages]);

  useEffect(() => {
    if (!isOpen || !activeConversationId) return;
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
  }, [activeConversationId, isOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {widgetState === 'closed' ? (
        <button
          type="button"
          onClick={() => setWidgetState('open')}
          aria-label="Mở chat hỗ trợ"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_32px_rgba(0,77,117,0.28)] transition hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          ) : null}
        </button>
      ) : null}

      {widgetState === 'minimized' ? (
        <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-2 py-2 shadow-lg">
          <button
            type="button"
            onClick={() => setWidgetState('open')}
            className="flex items-center gap-2 rounded-full px-2 py-1 text-[13px] font-medium text-on-surface"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            Chat hỗ trợ
            {totalUnread > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setWidgetState('closed')}
            aria-label="Đóng chat"
            className="rounded-full p-1.5 text-on-surface-variant transition hover:bg-surface-container-low"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {widgetState === 'open' ? (
        <section className="flex h-[480px] w-[min(360px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
          <header className="flex items-center justify-between border-b border-outline-variant bg-primary px-4 py-3 text-white">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">NexaTech</p>
              <h2 className="text-sm font-semibold">Chat hỗ trợ</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWidgetState('minimized')}
                aria-label="Thu nhỏ chat"
                className="rounded-full p-1.5 transition hover:bg-white/15"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setWidgetState('closed')}
                aria-label="Đóng chat"
                className="rounded-full p-1.5 transition hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 space-y-3 overflow-y-auto bg-surface-container-low px-3 py-3"
          >
            {isLoadingMessages ? (
              <div className="rounded-xl border border-dashed border-outline-variant bg-surface p-3 text-center text-xs text-on-surface-variant">
                Đang tải tin nhắn...
              </div>
            ) : null}

            {!isLoadingMessages && !activeConversationId ? (
              <div className="space-y-2 rounded-xl border border-dashed border-outline-variant bg-surface p-4 text-center">
                <p className="text-sm font-semibold text-on-surface">
                  Xin chào, NexaTech có thể giúp gì cho bạn?
                </p>
                <p className="text-xs leading-5 text-on-surface-variant">
                  Gửi câu hỏi về sản phẩm, đơn hàng hoặc tư vấn cấu hình để bắt đầu trò chuyện.
                </p>
              </div>
            ) : null}

            {!isLoadingMessages && activeConversationId && messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-outline-variant bg-surface p-4 text-center text-sm text-on-surface-variant">
                Hãy gửi tin nhắn đầu tiên cho đội hỗ trợ.
              </div>
            ) : null}

            {activeConversation?.status === 'WAITING' ? (
              <div className="rounded-xl border border-dashed border-outline-variant bg-surface p-3 text-center text-xs text-on-surface-variant">
                Đang chờ nhân viên tư vấn nhận cuộc trò chuyện...
              </div>
            ) : null}

            {messages.map((message) => {
              const isMine = message.senderId === currentParticipantId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      isMine ? 'bg-primary text-white' : 'bg-surface text-on-surface'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-5">{message.content}</p>
                    <div
                      className={`mt-1 flex items-center gap-2 text-[10px] ${
                        isMine ? 'text-white/75' : 'text-on-surface-variant'
                      }`}
                    >
                      <span>{formatTimestamp(message.createdAt)}</span>
                      {isMine ? <span>{statusLabel(message.status)}</span> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="border-t border-outline-variant bg-surface p-3">
            <div className="flex items-center gap-2">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={activeConversationId ? 'Nhập tin nhắn...' : 'Nhắn cho NexaTech...'}
                className="h-10 flex-1 rounded-xl border border-outline-variant bg-white px-3 text-sm text-on-surface outline-none transition focus:border-primary"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!inputValue.trim()}
                aria-label="Gửi tin nhắn"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-outline"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </section>
      ) : null}
    </div>
  );
}
