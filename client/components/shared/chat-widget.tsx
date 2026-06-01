
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
import type {
  ChatMessage,
  ChatMessageDeleted,
  Conversation,
  ConversationDeleted,
  ProductReference,
} from '@/features/chat/types';
import { getOrCreateGuestChatSessionId } from '@/features/chat/utils/guest-chat-session';

const MESSAGE_PAGE_SIZE = 30;
const AUTO_SCROLL_THRESHOLD = 80;

type WidgetState = 'closed' | 'minimized' | 'open';

export const PRODUCT_CONSULT_CHAT_EVENT = 'nexatech:chat-consult-product';

type ConsultChatEventDetail =
  | ProductReference
  | {
      product?: ProductReference | null;
      initialMessage?: string;
    };
type ProductConsultEvent = CustomEvent<ConsultChatEventDetail>;

function resolveWsUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_WS_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const trimmed = base?.replace(/\/$/, '') || 'http://localhost:8000';
  const sockJsBase = trimmed.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
  return `${sockJsBase}/ws/chat`;
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

function formatProductPrice(value?: number | null): string {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function ProductReferenceCard({
  product,
  compact = false,
  onClear,
}: {
  product: ProductReference;
  compact?: boolean;
  onClear?: () => void;
}) {
  const productUrl = `/product/${product.slug}`;

  return (
    <div className="mb-2 flex gap-2 rounded-xl border border-outline-variant bg-white/95 p-2 text-on-surface shadow-sm">
      {product.thumbnail ? (
        <img
          src={product.thumbnail}
          alt={product.name}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-container-low text-xs font-bold text-primary">
          SP
        </div>
      )}
      <div className="min-w-0 flex-1">
        <a
          href={productUrl}
          className="line-clamp-2 text-xs font-semibold leading-4 text-primary hover:underline"
        >
          {product.name}
        </a>
        {!compact && product.price ? (
          <p className="mt-0.5 text-xs font-bold text-on-surface">
            {formatProductPrice(product.price)}
          </p>
        ) : null}
      </div>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Bỏ chọn sản phẩm tư vấn"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function sameOptimisticMessage(message: ChatMessage, candidate: ChatMessage): boolean {
  return (
    candidate.id.startsWith('temp-') &&
    candidate.conversationId === message.conversationId &&
    candidate.senderId === message.senderId &&
    candidate.content === message.content
  );
}

function mergeMessage(current: ChatMessage[], message: ChatMessage): ChatMessage[] {
  const existingIndex = current.findIndex((item) => item.id === message.id);
  if (existingIndex >= 0) {
    const updated = [...current];
    updated[existingIndex] = message;
    return updated;
  }

  const optimisticIndex = current.findIndex((item) => sameOptimisticMessage(message, item));
  if (optimisticIndex >= 0) {
    const updated = [...current];
    updated[optimisticIndex] = message;
    return updated;
  }

  return [...current, message];
}

function replaceOptimisticMessage(
  current: ChatMessage[],
  optimisticId: string,
  saved: ChatMessage,
): ChatMessage[] {
  const replaced = current.map((message) => (message.id === optimisticId ? saved : message));
  return replaced.filter(
    (message, index, list) => list.findIndex((item) => item.id === message.id) === index,
  );
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
  const [selectedProduct, setSelectedProduct] = useState<ProductReference | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Record<string, StompSubscription>>({});
  const knownMessageIdsRef = useRef<Set<string>>(new Set());

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
    (conversation: Conversation): Conversation => {
      if (conversation.lastMessage?.id) {
        knownMessageIdsRef.current.add(conversation.lastMessage.id);
      }

      return {
        ...conversation,
        unreadCount: conversation.unreadCount ?? 0,
      };
    },
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
        ordered.forEach((message) => knownMessageIdsRef.current.add(message.id));
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
    setMessages((current) => mergeMessage(current, message));
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
      const isKnownMessage = knownMessageIdsRef.current.has(message.id);
      knownMessageIdsRef.current.add(message.id);

      updateConversationPreview(message);

      if (message.conversationId === activeConversationId) {
        upsertMessage(message);
        if (isOpen && autoScrollEnabled) {
          setTimeout(() => scrollToBottom('smooth'), 0);
        }
      }

      if (message.senderId !== currentParticipantId && !isKnownMessage) {
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
        if (!message.deliveredAt) {
          markDelivered(message.conversationId, message.id, { guestSessionId }).catch(() => undefined);
        }
        if (message.conversationId === activeConversationId && isOpen && !message.seenAt) {
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
      const messageKey = `${conversation.id}:messages`;
      const deletedKey = `${conversation.id}:deleted`;

      if (!subscriptionsRef.current[messageKey]) {
        subscriptionsRef.current[messageKey] = clientRef.current!.subscribe(
          `/topic/conversations/${conversation.id}/messages`,
          (message) => {
            try {
              handleIncomingMessage(JSON.parse(message.body) as ChatMessage);
            } catch {
              // Ignore malformed websocket payloads.
            }
          },
        );
      }

      if (!subscriptionsRef.current[deletedKey]) {
        subscriptionsRef.current[deletedKey] = clientRef.current!.subscribe(
          `/topic/conversations/${conversation.id}/messages/deleted`,
          (message) => {
            try {
              const deleted = JSON.parse(message.body) as ChatMessageDeleted;
              setMessages((current) => current.filter((item) => item.id !== deleted.id));
              setConversations((current) =>
                current.map((item) =>
                  item.id === deleted.conversationId && item.lastMessage?.id === deleted.id
                    ? { ...item, lastMessage: null }
                    : item,
                ),
              );
            } catch {
              // Ignore malformed websocket payloads.
            }
          },
        );
      }
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
      onConnect: () => {
        setConnected(true);
        subscriptionsRef.current['deleted-conversations'] = client.subscribe(
          '/topic/conversations/deleted',
          (message) => {
            try {
              const deleted = JSON.parse(message.body) as ConversationDeleted;
              setConversations((current) =>
                current.filter((conversation) => conversation.id !== deleted.id),
              );
              setMessages((current) => current.filter((item) => item.conversationId !== deleted.id));
              setActiveConversationId((current) => (current === deleted.id ? null : current));
            } catch {
              // Ignore malformed websocket payloads.
            }
          },
        );
      },
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
      productReference: selectedProduct,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      seenAt: null,
    };

    setMessages((current) => [...current, optimisticMessage]);
    updateConversationPreview(optimisticMessage);
    setInputValue('');
    setSelectedProduct(null);
    setTimeout(() => scrollToBottom('smooth'), 0);

    try {
      const saved = await sendMessage(conversation.id, trimmed, {
        guestSessionId,
        productReference: selectedProduct,
      });
      setMessages((current) => replaceOptimisticMessage(current, optimisticMessage.id, saved));
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
    selectedProduct,
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
          message.recipientId === currentParticipantId &&
          !message.seenAt,
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

  useEffect(() => {
    const handleConsultProduct = (event: Event) => {
      const detail = (event as ProductConsultEvent).detail;
      const initialMessage =
        detail && 'initialMessage' in detail && typeof detail.initialMessage === 'string'
          ? detail.initialMessage
          : undefined;
      const product =
        (detail && 'productId' in detail ? detail : detail?.product) ?? {
          productId: '',
          slug: '',
          name: initialMessage || 'cấu hình PC',
        };

      if (product?.productId && product.slug && product.name) {
        setSelectedProduct(product);
      }
      setWidgetState('open');
      setInputValue((current) => current || initialMessage || `Tư vấn về sản phẩm ${product.name}`);
      setTimeout(() => scrollToBottom('smooth'), 0);
    };

    window.addEventListener(PRODUCT_CONSULT_CHAT_EVENT, handleConsultProduct);
    return () => window.removeEventListener(PRODUCT_CONSULT_CHAT_EVENT, handleConsultProduct);
  }, [scrollToBottom]);

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
                Hãy gửi tin nhắn đầu tiên cho đội hỗ trợ
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
                    {message.productReference ? (
                      <ProductReferenceCard product={message.productReference} compact={isMine} />
                    ) : null}
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
            {selectedProduct ? (
              <ProductReferenceCard
                product={selectedProduct}
                onClear={() => setSelectedProduct(null)}
              />
            ) : null}
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
