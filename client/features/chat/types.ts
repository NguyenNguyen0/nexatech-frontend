export type ChatApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type CursorPageResponse<T> = {
  content: T[];
  nextCursor?: string;
  hasMore: boolean;
};

export type LastMessagePreview = {
  id: string;
  senderId: string;
  preview: string;
  sentAt: string;
};

export type Conversation = {
  id: string;
  customerId: string;
  agentId: string;
  otherUserId?: string;
  otherUserOnline?: boolean;
  lastMessage?: LastMessagePreview | null;
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
};

export type MessageStatus = 'SENT' | 'DELIVERED' | 'SEEN';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  status: MessageStatus;
  deliveredAt?: string | null;
  seenAt?: string | null;
  createdAt: string;
};
