import axiosClient from "@/lib/axiosClient";
import type { AgentChatMessage, AgentConversation, AgentConversationSummary, AgentToolCall } from "@/features/agent/types";

const AGENT_PREFIX = "/api/v1/agent";

type UnknownRecord = Record<string, unknown>;

function toObject(value: unknown): UnknownRecord {
  if (typeof value === "object" && value !== null) return value as UnknownRecord;
  return {};
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toIso(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  return new Date().toISOString();
}

function envelopeData(responseData: unknown): unknown {
  const obj = toObject(responseData);
  if (Array.isArray(responseData)) return responseData;
  if (obj.data !== undefined) return obj.data;
  if (obj.result !== undefined) return obj.result;
  return responseData;
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const obj = toObject(value);
  if (Array.isArray(obj.content)) return obj.content;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.threads)) return obj.threads;
  if (Array.isArray(obj.events)) return obj.events;
  return [];
}

function normalizeSummary(raw: UnknownRecord): AgentConversationSummary {
  const id = toString(raw.threadId) || toString(raw.id) || toString(raw.sessionId);
  const title = toString(raw.title) || toString(raw.name) || toString(toObject(raw.metadata).title) || `Thread ${id.slice(0, 8)}`;
  const updatedAt = toIso(raw.updatedAt || raw.lastUpdatedAt || raw.lastEventAt || raw.createdAt);
  const preview =
    toString(raw.preview)
    || toString(toObject(raw.lastMessage).preview)
    || toString(raw.summary)
    || toString(raw.lastMessage);

  return {
    id,
    title,
    updatedAt,
    preview,
  };
}

function normalizeMessage(raw: UnknownRecord, index: number): AgentChatMessage {
  return {
    id: toString(raw.id) || `msg-${index}-${Date.now()}`,
    role: toString(raw.role).toLowerCase() === "user" ? "user" : "assistant",
    content: toString(raw.content) || toString(toObject(raw.payload).content),
    createdAt: toIso(raw.createdAt || raw.timestamp),
  };
}

function normalizeToolFromEvent(rawEvent: UnknownRecord, state: AgentToolCall["state"]): AgentToolCall {
  const payload = toObject(rawEvent.data);
  const callId = toString(payload.callId) || toString(payload.id) || `tool-${Date.now()}`;
  const result = payload.result ?? payload.output ?? payload.data;
  const error = payload.error ?? payload.details;

  return {
    id: callId,
    name: toString(payload.toolName) || toString(payload.name) || "unknown_tool",
    args: toObject(payload.args),
    state,
    startedAt: toIso(rawEvent.timestamp),
    finishedAt: state === "pending" ? undefined : toIso(rawEvent.timestamp),
    errorMessage: toString(payload.errorMessage),
    result,
    error,
    completedAt: state === "pending" ? undefined : toIso(rawEvent.timestamp),
  };
}

function normalizeMessagesFromEvents(events: UnknownRecord[]): AgentChatMessage[] {
  const messages: AgentChatMessage[] = [];
  let assistantBuffer: AgentChatMessage | null = null;
  const toolById = new Map<string, AgentToolCall>();

  for (const event of events) {
    const eventType = toString(event.eventType).toLowerCase();
    const payload = toObject(event.payload);

    if (eventType === "user_message") {
      assistantBuffer = null;
      messages.push({
        id: toString(event.id) || `user-${Date.now()}-${messages.length}`,
        role: "user",
        content: toString(payload.message),
        createdAt: toIso(event.timestamp),
      });
      continue;
    }

    if (eventType === "agent_result") {
      const output = toObject(payload.output);
      const responseText = toString(output.response_text)
        || toString(output.responseText)
        || toString(output.message)
        || toString(output.content);

      const selectedTool = toString(output.selected_tool) || toString(output.selectedTool);
      const status = toString(payload.status);

      const assistantMessage: AgentChatMessage = {
        id: toString(event.id) || `assistant-${Date.now()}-${messages.length}`,
        role: "assistant",
        content: responseText || (status ? `Run status: ${status}` : ""),
        createdAt: toIso(event.timestamp),
      };

      if (selectedTool) {
        assistantMessage.toolCalls = [
          {
            id: `${selectedTool}-${toIso(event.timestamp)}`,
            name: selectedTool,
            args: {},
            state: "completed",
            startedAt: toIso(event.timestamp),
            finishedAt: toIso(event.timestamp),
          },
        ];
      }

      messages.push(assistantMessage);
      assistantBuffer = assistantMessage;
      continue;
    }

    if (eventType === "approval_decision") {
      const decision = toString(payload.decision);
      if (!assistantBuffer) {
        assistantBuffer = {
          id: `assistant-${Date.now()}-${messages.length}`,
          role: "assistant",
          content: "",
          createdAt: toIso(event.timestamp),
          uiCards: [],
        };
        messages.push(assistantBuffer);
      }
      assistantBuffer.uiCards = [
        ...(assistantBuffer.uiCards ?? []),
        {
          id: `hitl-${Date.now()}-${messages.length}`,
          type: "hitl",
          title: "HITL Decision",
          description: decision ? `Decision: ${decision}` : "Decision updated",
          payload,
        },
      ];
      continue;
    }

    if (eventType === "message.user" || payload.role === "user") {
      assistantBuffer = null;
      messages.push({
        id: toString(event.id) || `user-${Date.now()}-${messages.length}`,
        role: "user",
        content: toString(payload.content),
        createdAt: toIso(event.timestamp),
      });
      continue;
    }

    if (eventType === "message.chunk") {
      if (!assistantBuffer) {
        assistantBuffer = {
          id: `assistant-${Date.now()}-${messages.length}`,
          role: "assistant",
          content: "",
          createdAt: toIso(event.timestamp),
          toolCalls: [],
        };
        messages.push(assistantBuffer);
      }
      assistantBuffer.content += toString(payload.content);
      continue;
    }

    if (eventType.startsWith("tool.")) {
      if (!assistantBuffer) {
        assistantBuffer = {
          id: `assistant-${Date.now()}-${messages.length}`,
          role: "assistant",
          content: "",
          createdAt: toIso(event.timestamp),
          toolCalls: [],
        };
        messages.push(assistantBuffer);
      }

      if (eventType === "tool.started") {
        const tool = normalizeToolFromEvent({ data: payload, timestamp: event.timestamp }, "pending");
        toolById.set(tool.id, tool);
      }

      if (eventType === "tool.completed") {
        const tool = normalizeToolFromEvent({ data: payload, timestamp: event.timestamp }, "completed");
        const previous = toolById.get(tool.id);
        toolById.set(tool.id, { ...previous, ...tool });
      }

      if (eventType === "tool.error") {
        const tool = normalizeToolFromEvent({ data: payload, timestamp: event.timestamp }, "error");
        const previous = toolById.get(tool.id);
        toolById.set(tool.id, { ...previous, ...tool });
      }

      assistantBuffer.toolCalls = Array.from(toolById.values());
    }
  }

  return messages;
}

export async function listAgentConversations(limit = 20): Promise<AgentConversationSummary[]> {
  const response = await axiosClient.get(`${AGENT_PREFIX}/conversations`, {
    params: { limit },
  });

  const data = envelopeData(response.data);
  const items = extractArray(data);
  return items.map((item) => normalizeSummary(toObject(item))).filter((item) => Boolean(item.id));
}

export async function getAgentConversationDetail(threadId: string, limit = 100): Promise<AgentConversation> {
  const response = await axiosClient.get(`${AGENT_PREFIX}/conversations/${threadId}`, {
    params: { limit },
  });

  const data = toObject(envelopeData(response.data));
  const id = toString(data.threadId) || toString(data.id) || threadId;
  const title = toString(data.title) || toString(data.name) || `Thread ${id.slice(0, 8)}`;
  const createdAt = toIso(data.createdAt || data.timestamp);
  const updatedAt = toIso(data.updatedAt || data.lastUpdatedAt || data.timestamp);

  const messagesRaw = extractArray(data.messages);
  const eventsRaw = extractArray(data.events);

  const messages = messagesRaw.length > 0
    ? messagesRaw.map((item, index) => normalizeMessage(toObject(item), index))
    : normalizeMessagesFromEvents(eventsRaw.map((item) => toObject(item)));

  const safeMessages = messages.length > 0
    ? messages
    : [{
        id: `assistant-empty-${Date.now()}`,
        role: "assistant" as const,
        content: "Hoi thoai da ton tai nhung chua co noi dung hien thi duoc.",
        createdAt: toIso(data.updatedAt || data.createdAt || new Date().toISOString()),
      }];

  return {
    id,
    title,
    createdAt,
    updatedAt,
    messages: safeMessages,
  };
}

export async function createAgentSession(): Promise<AgentConversationSummary> {
  const response = await axiosClient.post(`${AGENT_PREFIX}/sessions`, {});
  return normalizeSummary(toObject(envelopeData(response.data)));
}

export async function updateAgentSessionTitle(threadId: string, title: string): Promise<void> {
  await axiosClient.patch(`${AGENT_PREFIX}/sessions/${threadId}`, { title });
}

export async function deleteAgentSession(threadId: string): Promise<void> {
  await axiosClient.delete(`${AGENT_PREFIX}/sessions/${threadId}`);
}

