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
  statusCode?: number;
  result?: unknown;
  error?: unknown;
  completedAt?: string;
}

export type AgentHitlDecision = "approved" | "rejected" | "edited";

export interface AgentHitlActionRequest {
  id: string;
  action: string;
  args: Record<string, unknown>;
  description?: string;
}

export interface AgentHitlReviewConfig {
  allowedDecisions?: string[];
  timeoutSeconds?: number;
  expiresAt?: string;
}

export interface AgentHitlPayload {
  approvalRequestId?: string;
  threadId?: string;
  timeoutSeconds?: number;
  expiresAt?: string;
  actionRequests: AgentHitlActionRequest[];
  reviewConfigs: AgentHitlReviewConfig[];
  raw?: Record<string, unknown>;
}

export interface AgentHitlDecisionInput {
  decision: AgentHitlDecision;
  modifiedArgs?: Record<string, unknown>;
  reason?: string;
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
  errorMessage?: string;
  retryPrompt?: string;
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

