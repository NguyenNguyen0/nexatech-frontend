export type AgentMessageRole = "user" | "assistant";

export type AgentToolCallState = "pending" | "completed" | "error";

export type AgentUICardType = "hitl" | "chart" | "news-canvas";

export interface AgentToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  state: AgentToolCallState;
  startedAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export interface AgentUICard {
  id: string;
  type: AgentUICardType;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
}

export interface AgentChatMessage {
  id: string;
  role: AgentMessageRole;
  content: string;
  createdAt: string;
  toolCalls?: AgentToolCall[];
  uiCards?: AgentUICard[];
  isStreaming?: boolean;
}

export interface AgentConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AgentChatMessage[];
}

export interface AgentConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
}

export interface AgentRunCallbacks {
  onTextDelta: (delta: string) => void;
  onToolCallUpdate: (toolCall: AgentToolCall) => void;
  onUICard: (card: AgentUICard) => void;
}
