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
  customerId?: string | null;
  agentId?: string | null;
  conversationType: 'AUTHENTICATED' | 'GUEST';
  status: 'WAITING' | 'OPEN' | 'CLOSED';
  currentParticipantId: string;
  otherUserId?: string;
  otherUserOnline?: boolean;
  lastMessage?: LastMessagePreview | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
};

export type ConversationDeleted = {
  id: string;
  deletedAt: string;
};

export type MessageStatus = 'SENT' | 'DELIVERED' | 'SEEN';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId?: string | null;
  content: string;
  status: MessageStatus;
  deliveredAt?: string | null;
  seenAt?: string | null;
  createdAt: string;
};

export type ChatMessageDeleted = {
  id: string;
  conversationId: string;
  deletedAt: string;
};
