import axiosClient from '@/lib/axios-client';
import type {
  ChatApiResponse,
  ChatMessage,
  Conversation,
  CursorPageResponse,
  PageResponse,
} from '../types';

const CHAT_BASE = '/api/v1/conversations';

function unwrapResponse<T>(response: ChatApiResponse<T>): T {
  if (!response?.success || response.data === undefined) {
    throw new Error(response?.message || 'Chat API request failed');
  }
  return response.data;
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
): Promise<CursorPageResponse<ChatMessage>> {
  const { data } = await axiosClient.get<ChatApiResponse<CursorPageResponse<ChatMessage>>>(
    `${CHAT_BASE}/${conversationId}/messages`,
    { params: { cursor, size } },
  );
  return unwrapResponse(data);
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ChatMessage> {
  const { data } = await axiosClient.post<ChatApiResponse<ChatMessage>>(
    `${CHAT_BASE}/${conversationId}/messages`,
    { content },
  );
  return unwrapResponse(data);
}

export async function markDelivered(
  conversationId: string,
  messageId: string,
): Promise<ChatMessage> {
  const { data } = await axiosClient.put<ChatApiResponse<ChatMessage>>(
    `${CHAT_BASE}/${conversationId}/messages/${messageId}/delivered`,
  );
  return unwrapResponse(data);
}

export async function markSeen(
  conversationId: string,
  messageId: string,
): Promise<ChatMessage> {
  const { data } = await axiosClient.put<ChatApiResponse<ChatMessage>>(
    `${CHAT_BASE}/${conversationId}/messages/${messageId}/seen`,
  );
  return unwrapResponse(data);
}
