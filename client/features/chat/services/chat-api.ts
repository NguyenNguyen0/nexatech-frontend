import axiosClient from '@/lib/axios-client';
import type {
  ChatApiResponse,
  ChatMessage,
  Conversation,
  CursorPageResponse,
  PageResponse,
} from '../types';

const CHAT_BASE = '/api/v1/conversations';

type GuestAwareOptions = {
  guestSessionId?: string | null;
};

function unwrapResponse<T>(response: ChatApiResponse<T>): T {
  if (!response?.success || response.data === undefined) {
    throw new Error(response?.message || 'Chat API request failed');
  }
  return response.data;
}

function guestHeaders(guestSessionId?: string | null): Record<string, string> | undefined {
  if (!guestSessionId) return undefined;
  return { 'X-Guest-Session-Id': guestSessionId };
}

export async function fetchCurrentConversation(
  options: GuestAwareOptions = {},
): Promise<Conversation> {
  const { data } = await axiosClient.get<ChatApiResponse<Conversation>>(`${CHAT_BASE}/current`, {
    headers: guestHeaders(options.guestSessionId),
  });
  return unwrapResponse(data);
}

export async function createOrGetCurrentConversation(
  options: GuestAwareOptions = {},
): Promise<Conversation> {
  const { data } = await axiosClient.post<ChatApiResponse<Conversation>>(
    `${CHAT_BASE}/current`,
    undefined,
    { headers: guestHeaders(options.guestSessionId) },
  );
  return unwrapResponse(data);
}

export async function fetchConversations(
  page = 0,
  size = 20,
): Promise<PageResponse<Conversation>> {
  const { data } = await axiosClient.get<ChatApiResponse<PageResponse<Conversation>>>(
    CHAT_BASE,
    { params: { page, size } },
  );
  return unwrapResponse(data);
}

export async function fetchMessages(
  conversationId: string,
  cursor?: string,
  size = 30,
  options: GuestAwareOptions = {},
): Promise<CursorPageResponse<ChatMessage>> {
  const { data } = await axiosClient.get<ChatApiResponse<CursorPageResponse<ChatMessage>>>(
    `${CHAT_BASE}/${conversationId}/messages`,
    {
      params: { cursor, size },
      headers: guestHeaders(options.guestSessionId),
    },
  );
  return unwrapResponse(data);
}

export async function sendMessage(
  conversationId: string,
  content: string,
  options: GuestAwareOptions = {},
): Promise<ChatMessage> {
  const { data } = await axiosClient.post<ChatApiResponse<ChatMessage>>(
    `${CHAT_BASE}/${conversationId}/messages`,
    { content },
    { headers: guestHeaders(options.guestSessionId) },
  );
  return unwrapResponse(data);
}

export async function markDelivered(
  conversationId: string,
  messageId: string,
  options: GuestAwareOptions = {},
): Promise<ChatMessage> {
  const { data } = await axiosClient.put<ChatApiResponse<ChatMessage>>(
    `${CHAT_BASE}/${conversationId}/messages/${messageId}/delivered`,
    undefined,
    { headers: guestHeaders(options.guestSessionId) },
  );
  return unwrapResponse(data);
}

export async function markSeen(
  conversationId: string,
  messageId: string,
  options: GuestAwareOptions = {},
): Promise<ChatMessage> {
  const { data } = await axiosClient.put<ChatApiResponse<ChatMessage>>(
    `${CHAT_BASE}/${conversationId}/messages/${messageId}/seen`,
    undefined,
    { headers: guestHeaders(options.guestSessionId) },
  );
  return unwrapResponse(data);
}
