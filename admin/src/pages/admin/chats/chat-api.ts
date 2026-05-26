import axiosClient from "@/lib/axiosClient";
import {
    getAccessToken,
    getRolesFromAccessToken,
    getUserIdFromAccessToken,
    pickPrimaryRole,
} from "@/services/authSession";

export type ChatApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

export type PageResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

export type LastMessagePreview = {
    id: string;
    senderId: string;
    preview: string;
    sentAt: string;
};

export type Conversation = {
    id: string;
    customerId?: string | null;
    agentId?: string | null;
    conversationType: "AUTHENTICATED" | "GUEST";
    status: "WAITING" | "OPEN" | "CLOSED";
    currentParticipantId?: string | null;
    otherUserId?: string | null;
    participant?: {
        id: string;
        type: "USER" | "GUEST" | string;
        displayName?: string | null;
        email?: string | null;
        username?: string | null;
        avatarUrl?: string | null;
    } | null;
    otherUserOnline?: boolean;
    lastMessage?: LastMessagePreview | null;
    expiresAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type ConversationDeleted = {
    id: string;
    deletedAt: string;
};

export type ChatMessage = {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId?: string | null;
    content: string;
    productReference?: {
        productId: string;
        slug: string;
        name: string;
        thumbnail?: string | null;
        price?: number | null;
    } | null;
    status: "SENT" | "DELIVERED" | "SEEN";
    deliveredAt?: string | null;
    seenAt?: string | null;
    createdAt: string;
};

export type ChatMessageDeleted = {
    id: string;
    conversationId: string;
    deletedAt: string;
};

export type CursorPageResponse<T> = {
    content: T[];
    nextCursor?: string | null;
    hasMore: boolean;
};

const CHAT_BASE = "/api/v1/conversations";

function adminChatHeaders(): Record<string, string> {
    const token = getAccessToken();
    const userId = getUserIdFromAccessToken(token);
    const role = pickPrimaryRole(getRolesFromAccessToken(token));
    const headers: Record<string, string> = {};

    if (userId) headers["X-User-Id"] = userId;
    if (role) headers["X-User-Role"] = role;

    return headers;
}

function unwrap<T>(response: ChatApiResponse<T>): T {
    if (!response?.success || response.data === undefined) {
        throw new Error(response?.message || "Chat API request failed");
    }
    return response.data;
}

export async function fetchConversations(page = 0, size = 50): Promise<PageResponse<Conversation>> {
    const { data } = await axiosClient.get<ChatApiResponse<PageResponse<Conversation>>>(CHAT_BASE, {
        params: { page, size },
        headers: adminChatHeaders(),
    });
    return unwrap(data);
}

export async function fetchMessages(
    conversationId: string,
    cursor?: string,
    size = 50,
): Promise<CursorPageResponse<ChatMessage>> {
    const { data } = await axiosClient.get<ChatApiResponse<CursorPageResponse<ChatMessage>>>(
        `${CHAT_BASE}/${conversationId}/messages`,
        {
            params: { cursor, size },
            headers: adminChatHeaders(),
        },
    );
    return unwrap(data);
}

export async function deleteConversation(conversationId: string): Promise<ConversationDeleted> {
    const { data } = await axiosClient.delete<ChatApiResponse<ConversationDeleted>>(
        `${CHAT_BASE}/${conversationId}`,
        { headers: adminChatHeaders() },
    );
    return unwrap(data);
}

export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    const { data } = await axiosClient.post<ChatApiResponse<ChatMessage>>(
        `${CHAT_BASE}/${conversationId}/messages`,
        { content },
        { headers: adminChatHeaders() },
    );
    return unwrap(data);
}

export async function markSeen(conversationId: string, messageId: string): Promise<ChatMessage> {
    const { data } = await axiosClient.put<ChatApiResponse<ChatMessage>>(
        `${CHAT_BASE}/${conversationId}/messages/${messageId}/seen`,
        undefined,
        { headers: adminChatHeaders() },
    );
    return unwrap(data);
}

export async function deleteMessage(conversationId: string, messageId: string): Promise<ChatMessageDeleted> {
    const { data } = await axiosClient.delete<ChatApiResponse<ChatMessageDeleted>>(
        `${CHAT_BASE}/${conversationId}/messages/${messageId}`,
        { headers: adminChatHeaders() },
    );
    return unwrap(data);
}
