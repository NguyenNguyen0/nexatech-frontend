import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Client, StompSubscription } from "@stomp/stompjs";
import dayjs from "dayjs";
import {
    IconArrowLeft,
    IconDotsVertical,
    IconMessages,
    IconSearch,
    IconSend,
    IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Layout } from "@/components/custom/layout";
import { Button } from "@/components/custom/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAccessToken, getRolesFromAccessToken, getUserIdFromAccessToken, pickPrimaryRole } from "@/services/authSession";
import {
    deleteMessage,
    deleteConversation,
    type ChatMessageDeleted,
    type ChatMessage,
    type ConversationDeleted,
    type Conversation,
    fetchConversations,
    fetchMessages,
    markSeen,
    sendMessage,
} from "./chat-api";

const CONVERSATION_PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 30;
const REALTIME_FALLBACK_INTERVAL_MS = 15000;

function resolveWsUrl(): string {
    const base = import.meta.env.VITE_WS_BASE_URL || import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080";
    return `${String(base).replace(/\/$/, "")}/ws/chat`;
}

function displayName(conversation: Conversation): string {
    if (conversation.participant?.displayName) {
        return conversation.participant.displayName;
    }
    if (conversation.conversationType === "GUEST") {
        return `Khách ${conversation.otherUserId?.slice(0, 8) ?? conversation.id.slice(0, 8)}`;
    }
    return `Người dùng ${conversation.customerId?.slice(0, 8) ?? conversation.id.slice(0, 8)}`;
}

function initials(conversation: Conversation): string {
    const name = displayName(conversation).trim();
    if (name) {
        return name.slice(0, 1).toUpperCase();
    }
    return conversation.conversationType === "GUEST" ? "K" : "U";
}

function conversationSubtitle(conversation: Conversation): string {
    if (conversation.lastMessage?.preview) return conversation.lastMessage.preview;
    if (conversation.participant?.email) return conversation.participant.email;
    return conversation.conversationType === "GUEST" ? "Khách chưa đăng nhập" : "Khách hàng đã đăng nhập";
}

function conversationSortTime(conversation: Conversation): string {
    return conversation.lastMessage?.sentAt || conversation.updatedAt || conversation.createdAt || "";
}

function sortConversations(items: Conversation[]): Conversation[] {
    return [...items].sort((a, b) => conversationSortTime(b).localeCompare(conversationSortTime(a)));
}

function formatProductPrice(value?: number | null): string {
    if (typeof value !== "number") return "";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function productHref(slug: string): string {
    const base = import.meta.env.VITE_STOREFRONT_BASE_URL || "http://localhost:3000";
    return `${String(base).replace(/\/$/, "")}/product/${slug}`;
}

function sameOptimisticMessage(message: ChatMessage, candidate: ChatMessage): boolean {
    return (
        candidate.id.startsWith("temp-")
        && candidate.conversationId === message.conversationId
        && candidate.senderId === message.senderId
        && candidate.content === message.content
    );
}

function mergeMessage(current: ChatMessage[], incoming: ChatMessage): ChatMessage[] {
    const existingIndex = current.findIndex((item) => item.id === incoming.id);
    if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = incoming;
        return next;
    }

    const optimisticIndex = current.findIndex((item) => sameOptimisticMessage(incoming, item));
    if (optimisticIndex >= 0) {
        const next = [...current];
        next[optimisticIndex] = incoming;
        return next;
    }

    return [...current, incoming];
}

function replaceOptimisticMessage(current: ChatMessage[], optimisticId: string, saved: ChatMessage): ChatMessage[] {
    const replaced = current.map((item) => (item.id === optimisticId ? saved : item));
    return replaced.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
}

export default function Chats() {
    const [search, setSearch] = useState("");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState("");
    const [mobileSelectedUser, setMobileSelectedUser] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const clientRef = useRef<Client | null>(null);
    const socketConnectingRef = useRef(false);
    const subscriptionsRef = useRef<Record<string, StompSubscription>>({});
    const selectedConversationIdRef = useRef<string | null>(null);
    const adminUserIdRef = useRef<string | null>(null);
    const loadingConversationsRef = useRef(false);
    const loadingMessagesRef = useRef<Set<string>>(new Set());
    const adminUserId = useMemo(() => getUserIdFromAccessToken(getAccessToken()), []);
    const adminRole = useMemo(() => pickPrimaryRole(getRolesFromAccessToken(getAccessToken())) ?? "ADMIN", []);
    const wsUrl = useMemo(resolveWsUrl, []);

    const selectedConversation = useMemo(
        () => conversations.find((item) => item.id === selectedConversationId) ?? conversations[0] ?? null,
        [conversations, selectedConversationId],
    );

    const filteredConversations = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return conversations;
        return conversations.filter((conversation) =>
            displayName(conversation).toLowerCase().includes(keyword)
            || conversationSubtitle(conversation).toLowerCase().includes(keyword),
        );
    }, [conversations, search]);

    useEffect(() => {
        selectedConversationIdRef.current = selectedConversation?.id ?? null;
    }, [selectedConversation?.id]);

    useEffect(() => {
        adminUserIdRef.current = adminUserId;
    }, [adminUserId]);

    const upsertConversation = useCallback((conversation: Conversation) => {
        setConversations((current) => {
            const existingIndex = current.findIndex((item) => item.id === conversation.id);
            const next = existingIndex >= 0 ? [...current] : [conversation, ...current];
            if (existingIndex >= 0) {
                next[existingIndex] = { ...next[existingIndex], ...conversation };
            }
            return sortConversations(next);
        });
        setSelectedConversationId((current) => current ?? conversation.id);
    }, []);

    const upsertMessage = useCallback((incoming: ChatMessage) => {
        setMessages((current) => mergeMessage(current, incoming));
    }, []);

    const loadConversations = useCallback(async () => {
        if (loadingConversationsRef.current) return;
        loadingConversationsRef.current = true;
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const page = await fetchConversations(0, CONVERSATION_PAGE_SIZE);
            setConversations(sortConversations(page.content));
            setSelectedConversationId((current) => current ?? page.content[0]?.id ?? null);
        } catch (error) {
            setConversations([]);
            setSelectedConversationId(null);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Không thể tải danh sách hội thoại",
            );
        } finally {
            loadingConversationsRef.current = false;
            setIsLoading(false);
        }
    }, []);

    const loadMessages = useCallback(async (conversationId: string) => {
        if (loadingMessagesRef.current.has(conversationId)) return;
        loadingMessagesRef.current.add(conversationId);
        try {
            const page = await fetchMessages(conversationId, undefined, MESSAGE_PAGE_SIZE);
            const ordered = [...page.content].reverse();
            setMessages(ordered);
            const latestIncoming = [...ordered].reverse().find((item) => item.senderId !== adminUserId);
            if (latestIncoming) {
                markSeen(conversationId, latestIncoming.id).catch(() => undefined);
            }
        } catch (error) {
            setMessages([]);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Không thể tải tin nhắn",
            );
        } finally {
            loadingMessagesRef.current.delete(conversationId);
        }
    }, [adminUserId]);

    const handleIncomingMessage = useCallback((incoming: ChatMessage) => {
        const activeConversationId = selectedConversationIdRef.current;
        const activeAdminUserId = adminUserIdRef.current;

        setConversations((current) =>
            sortConversations(current.map((conversation) =>
                conversation.id === incoming.conversationId
                    ? {
                        ...conversation,
                        lastMessage: {
                            id: incoming.id,
                            senderId: incoming.senderId,
                            preview: incoming.content,
                            sentAt: incoming.createdAt,
                        },
                    }
                    : conversation,
            )),
        );

        if (incoming.conversationId === activeConversationId) {
            upsertMessage(incoming);
            if (incoming.senderId !== activeAdminUserId) {
                markSeen(incoming.conversationId, incoming.id).catch(() => undefined);
            }
        }
    }, [upsertMessage]);

    const handleGlobalMessage = useCallback((incoming: ChatMessage) => {
        handleIncomingMessage(incoming);
        if (incoming.conversationId === selectedConversationIdRef.current) {
            void loadMessages(incoming.conversationId);
        }
    }, [handleIncomingMessage, loadMessages]);

    const handleDeletedMessage = useCallback((deleted: ChatMessageDeleted) => {
        setMessages((current) => current.filter((item) => item.id !== deleted.id));
        setConversations((current) =>
            sortConversations(current.map((conversation) =>
                conversation.id === deleted.conversationId && conversation.lastMessage?.id === deleted.id
                    ? { ...conversation, lastMessage: null }
                    : conversation,
            )),
        );
        if (deleted.conversationId === selectedConversationIdRef.current) {
            void loadMessages(deleted.conversationId);
        }
    }, [loadMessages]);

    const handleDeletedConversation = useCallback((deleted: ConversationDeleted) => {
        setConversations((current) => current.filter((conversation) => conversation.id !== deleted.id));
        setMessages((current) =>
            selectedConversationIdRef.current === deleted.id ? [] : current,
        );
        setSelectedConversationId((current) => (current === deleted.id ? null : current));
    }, []);

    const handleConversationUpdate = useCallback((conversation: Conversation) => {
        upsertConversation(conversation);
        if (conversation.id === selectedConversationIdRef.current && conversation.lastMessage?.id) {
            void loadMessages(conversation.id);
        }
    }, [loadMessages, upsertConversation]);

    const connectSocket = useCallback(async () => {
        if (clientRef.current || socketConnectingRef.current) return;
        socketConnectingRef.current = true;
        const [{ Client }, { default: SockJS }] = await Promise.all([
            import("@stomp/stompjs"),
            import("sockjs-client"),
        ]);
        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                ...(adminUserId ? { "X-User-Id": adminUserId } : {}),
                "X-User-Role": adminRole,
            },
            reconnectDelay: 5000,
            onWebSocketClose: () => setConnected(false),
            onStompError: (frame) => {
                setConnected(false);
                setErrorMessage(frame.headers.message || "WebSocket STOMP error");
            },
            onWebSocketError: () => {
                setConnected(false);
                setErrorMessage("WebSocket connection failed");
            },
            onConnect: () => {
                setErrorMessage(null);
                setConnected(true);
                subscriptionsRef.current["all-conversations"] = client.subscribe("/topic/conversations", (frame) => {
                    try {
                        handleConversationUpdate(JSON.parse(frame.body) as Conversation);
                    } catch {
                        // Ignore malformed websocket payloads.
                    }
                });
                subscriptionsRef.current["deleted-conversations"] = client.subscribe("/topic/conversations/deleted", (frame) => {
                    try {
                        handleDeletedConversation(JSON.parse(frame.body) as ConversationDeleted);
                    } catch {
                        // Ignore malformed websocket payloads.
                    }
                });
                subscriptionsRef.current["all-messages"] = client.subscribe("/topic/messages", (frame) => {
                    try {
                        handleGlobalMessage(JSON.parse(frame.body) as ChatMessage);
                    } catch {
                        // Ignore malformed websocket payloads.
                    }
                });
            },
            onDisconnect: () => setConnected(false),
        });
        client.activate();
        clientRef.current = client;
        socketConnectingRef.current = false;
    }, [adminRole, adminUserId, handleConversationUpdate, handleDeletedConversation, handleGlobalMessage, wsUrl]);

    const disconnectSocket = useCallback(() => {
        if (!clientRef.current) return;
        clientRef.current.deactivate();
        clientRef.current = null;
        socketConnectingRef.current = false;
        subscriptionsRef.current = {};
        setConnected(false);
    }, []);

    const ensureConversationSubscriptions = useCallback(() => {
        if (!clientRef.current || !connected) return;
        conversations.forEach((conversation) => {
            const messageKey = `${conversation.id}:messages`;
            const deletedKey = `${conversation.id}:deleted`;

            if (!subscriptionsRef.current[messageKey]) {
                subscriptionsRef.current[messageKey] = clientRef.current!.subscribe(
                `/topic/conversations/${conversation.id}/messages`,
                (frame) => {
                    try {
                        handleIncomingMessage(JSON.parse(frame.body) as ChatMessage);
                    } catch {
                        // Ignore malformed websocket payloads.
                    }
                },
                );
            }

            if (!subscriptionsRef.current[deletedKey]) {
                subscriptionsRef.current[deletedKey] = clientRef.current!.subscribe(
                    `/topic/conversations/${conversation.id}/messages/deleted`,
                    (frame) => {
                        try {
                            handleDeletedMessage(JSON.parse(frame.body) as ChatMessageDeleted);
                        } catch {
                            // Ignore malformed websocket payloads.
                        }
                    },
                );
            }
        });
    }, [connected, conversations, handleDeletedMessage, handleIncomingMessage]);

    const handleSendMessage = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || !selectedConversation) return;

        const optimistic: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId: selectedConversation.id,
            senderId: adminUserId ?? "admin",
            recipientId: selectedConversation.otherUserId ?? selectedConversation.customerId ?? null,
            content: trimmed,
            status: "SENT",
            createdAt: new Date().toISOString(),
            deliveredAt: null,
            seenAt: null,
        };

        setMessage("");
        upsertMessage(optimistic);
        try {
            const saved = await sendMessage(selectedConversation.id, trimmed);
            setMessages((current) => replaceOptimisticMessage(current, optimistic.id, saved));
            handleIncomingMessage(saved);
        } catch {
            setMessages((current) => current.filter((item) => item.id !== optimistic.id));
        }
    };

    const handleDeleteMessage = async (item: ChatMessage) => {
        if (item.id.startsWith("temp-")) {
            setMessages((current) => current.filter((messageItem) => messageItem.id !== item.id));
            return;
        }

        const confirmed = window.confirm("Xoa tin nhan nay?");
        if (!confirmed) return;

        setMessages((current) => current.filter((messageItem) => messageItem.id !== item.id));
        try {
            await deleteMessage(item.conversationId, item.id);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Khong the xoa tin nhan");
            void loadMessages(item.conversationId);
        }
    };

    const handleDeleteConversation = async (conversation: Conversation) => {
        const confirmed = window.confirm("Xoá cuộc trò chuyện?");
        if (!confirmed) return;

        handleDeletedConversation({ id: conversation.id, deletedAt: new Date().toISOString() });
        try {
            await deleteConversation(conversation.id);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Khong the xoa cuoc tro chuyen");
            void loadConversations();
            if (conversation.id === selectedConversationIdRef.current) {
                void loadMessages(conversation.id);
            }
        }
    };

    useEffect(() => {
        void loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        void connectSocket();
        return () => disconnectSocket();
    }, [connectSocket, disconnectSocket]);

    useEffect(() => {
        ensureConversationSubscriptions();
    }, [ensureConversationSubscriptions]);

    useEffect(() => {
        if (connected) return;

        const intervalId = window.setInterval(() => {
            if (document.visibilityState !== "visible") return;
            void loadConversations();
            const activeConversationId = selectedConversationIdRef.current;
            if (activeConversationId) {
                void loadMessages(activeConversationId);
            }
        }, REALTIME_FALLBACK_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [connected, loadConversations, loadMessages]);

    useEffect(() => {
        if (!selectedConversation?.id) return;
        void loadMessages(selectedConversation.id);
    }, [loadMessages, selectedConversation?.id]);

    return (
        <Layout fixed>
            <Layout.Body className="overflow-hidden">
                <section className="flex h-full min-h-0 gap-6">
                    <div className="flex h-full min-h-0 w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80">
                        <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex gap-2">
                                    <h1 className="text-2xl font-bold">Inbox</h1>
                                    <IconMessages size={20} />
                                </div>
                                <span className={cn("rounded-full px-2 py-1 text-xs", connected ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                                    {connected ? "Realtime" : "Offline"}
                                </span>
                            </div>

                            <label className="flex h-12 w-full items-center rounded-md border border-input pl-2 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring">
                                <IconSearch size={15} className="mr-2 stroke-slate-500" />
                                <span className="sr-only">Search</span>
                                <input
                                    type="text"
                                    className="w-full flex-1 bg-inherit text-sm focus-visible:outline-none"
                                    placeholder="Search chat..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="-mx-3 min-h-0 flex-1 overflow-auto p-3">
                            {isLoading && conversations.length === 0 ? (
                                <div className="px-2 py-4 text-sm text-muted-foreground">Đang tải hội thoại...</div>
                            ) : null}
                            {errorMessage ? (
                                <div className="mx-1 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {errorMessage}
                                </div>
                            ) : null}
                            {filteredConversations.map((conversation) => (
                                <Fragment key={conversation.id}>
                                    <button
                                        type="button"
                                        className={cn(
                                            "-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75",
                                            selectedConversation?.id === conversation.id && "sm:bg-muted",
                                        )}
                                        onClick={() => {
                                            setSelectedConversationId(conversation.id);
                                            setMobileSelectedUser(true);
                                        }}
                                    >
                                        <div className="flex min-w-0 gap-2">
                                            <Avatar>
                                                {conversation.participant?.avatarUrl ? (
                                                    <img
                                                        src={conversation.participant.avatarUrl}
                                                        alt={displayName(conversation)}
                                                        className="h-full w-full rounded-full object-cover"
                                                    />
                                                ) : null}
                                                <AvatarFallback>{initials(conversation)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <span className="block truncate font-medium">{displayName(conversation)}</span>
                                                <span className="line-clamp-2 text-muted-foreground">
                                                    {conversationSubtitle(conversation)}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                    <div className="-mt-11 mb-2 flex justify-end pr-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    aria-label="Mo tuy chon cuoc tro chuyen"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <IconDotsVertical size={16} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={() => void handleDeleteConversation(conversation)}
                                                >
                                                    <IconTrash size={15} />
                                                    Xoá cuộc trò chuyện
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <Separator className="my-1" />
                                </Fragment>
                            ))}
                            {!isLoading && filteredConversations.length === 0 ? (
                                <div className="px-2 py-4 text-sm text-muted-foreground">Chưa có hội thoại.</div>
                            ) : null}
                        </div>
                    </div>

                    <div
                        className={cn(
                            "absolute inset-0 left-full z-50 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex",
                            mobileSelectedUser && "left-0",
                        )}
                    >
                        <div className="mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg">
                            <div className="flex gap-3">
                                <Button size="icon" variant="ghost" className="-ml-2 h-full sm:hidden" onClick={() => setMobileSelectedUser(false)}>
                                    <IconArrowLeft />
                                </Button>
                                <div className="flex items-center gap-2 lg:gap-4">
                                    <Avatar className="size-9 lg:size-11">
                                        <AvatarFallback>{selectedConversation ? initials(selectedConversation) : "C"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="block text-sm font-medium lg:text-base">
                                            {selectedConversation ? displayName(selectedConversation) : "Chọn hội thoại"}
                                        </span>
                                        <span className="block max-w-44 truncate text-xs text-muted-foreground lg:max-w-none lg:text-sm">
                                            {selectedConversation ? conversationSubtitle(selectedConversation) : "Tin nhắn từ khách sẽ hiển thị tại đây"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {selectedConversation ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Mo tuy chon cuoc tro chuyen"
                                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
                                        >
                                            <IconDotsVertical size={18} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onSelect={() => void handleDeleteConversation(selectedConversation)}
                                        >
                                            <IconTrash size={15} />
                                            Xoá cuộc trò chuyện
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : null}
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0">
                            <div className="flex min-h-0 w-full flex-1">
                                <div className="chat-text-container relative -mr-4 flex min-h-0 flex-1 flex-col overflow-y-hidden">
                                    <div className="chat-flex flex h-0 w-full flex-1 flex-col justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4">
                                        {messages.map((item) => {
                                            const isMine = item.senderId === adminUserId || item.senderId === "admin";
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "group/chat-message chat-box relative max-w-72 break-words px-3 py-2 shadow-lg",
                                                        isMine
                                                            ? "self-end rounded-[16px_16px_0_16px] bg-primary/85 text-primary-foreground"
                                                            : "self-start rounded-[16px_16px_16px_0] bg-secondary",
                                                    )}
                                                >
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                aria-label="Mo tuy chon tin nhan"
                                                                className={cn(
                                                                    "absolute top-1 hidden h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border transition hover:text-foreground group-hover/chat-message:flex",
                                                                    isMine ? "-left-9" : "-right-9",
                                                                )}
                                                            >
                                                                <IconDotsVertical size={16} />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align={isMine ? "end" : "start"} className="w-36">
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onSelect={() => void handleDeleteMessage(item)}
                                                            >
                                                                <IconTrash size={15} />
                                                                Xoa tin nhan
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    {item.productReference ? (
                                                        <a
                                                            href={productHref(item.productReference.slug)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={cn(
                                                                "mb-2 flex gap-2 rounded-md border bg-background/95 p-2 text-left text-foreground shadow-sm transition hover:border-primary/50",
                                                                isMine && "bg-primary-foreground/95 text-foreground",
                                                            )}
                                                        >
                                                            {item.productReference.thumbnail ? (
                                                                <img
                                                                    src={item.productReference.thumbnail}
                                                                    alt={item.productReference.name}
                                                                    className="h-12 w-12 shrink-0 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                                                                    SP
                                                                </div>
                                                            )}
                                                            <span className="min-w-0 flex-1">
                                                                <span className="line-clamp-2 block text-xs font-semibold leading-4 text-primary">
                                                                    {item.productReference.name}
                                                                </span>
                                                                {item.productReference.price ? (
                                                                    <span className="mt-0.5 block text-xs font-bold">
                                                                        {formatProductPrice(item.productReference.price)}
                                                                    </span>
                                                                ) : null}
                                                            </span>
                                                        </a>
                                                    ) : null}
                                                    <p className="whitespace-pre-wrap">{item.content}</p>
                                                    <span className={cn("mt-1 block text-xs font-light italic text-muted-foreground", isMine && "text-right text-primary-foreground/75")}>
                                                        {dayjs(item.createdAt).format("HH:mm")}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSendMessage} className="flex w-full flex-none gap-2">
                                <div className="flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4">
                                    <label className="flex-1">
                                        <span className="sr-only">Chat Text Box</span>
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder={selectedConversation ? "Nhập tin nhắn..." : "Chọn hội thoại trước"}
                                            disabled={!selectedConversation}
                                            className="h-8 w-full bg-inherit focus-visible:outline-none disabled:cursor-not-allowed"
                                        />
                                    </label>
                                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex" type="submit" disabled={!selectedConversation || !message.trim()}>
                                        <IconSend size={20} />
                                    </Button>
                                </div>
                                <Button className="h-full sm:hidden" rightSection={<IconSend size={18} />} disabled={!selectedConversation || !message.trim()}>
                                    Send
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>
            </Layout.Body>
        </Layout>
    );
}
