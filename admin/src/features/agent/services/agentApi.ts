import axios from "axios";
import axiosClient from "@/lib/axiosClient";
import { getAccessToken } from "@/services/authSession";
import type { AgentChatMessage, AgentConversation, AgentConversationSummary, AgentToolCall } from "@/features/agent/types";

const AGENT_PREFIX = "/api/v1/agent";

type UnknownRecord = Record<string, unknown>;

type StreamEnvelope = {
  eventType?: string;
  runId?: string;
  threadId?: string;
  timestamp?: string;
  data?: UnknownRecord;
};

type NormalRunResponse = {
  threadId?: string;
  status?: string;
  output?: unknown;
  interrupts?: unknown[];
  state?: {
    values?: UnknownRecord;
  };
};

export type AgentStreamEventName =
  | "run.started"
  | "message.chunk"
  | "tool.started"
  | "tool.completed"
  | "tool.error"
  | "hitl.interrupt"
  | "run.completed"
  | "run.cancelled"
  | "run.error"
  | "unknown";

export interface AgentStreamEvent {
  name: AgentStreamEventName;
  runId?: string;
  threadId?: string;
  timestamp: string;
  data: UnknownRecord;
}

export interface StartAgentStreamInput {
  message: string;
  threadId?: string;
  runId?: string;
}

export interface StartAgentStreamHandlers {
  onEvent: (event: AgentStreamEvent) => void;
}

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

function normalizeEventName(value: string): AgentStreamEventName {
  switch (value) {
    case "run.started":
    case "message.chunk":
    case "tool.started":
    case "tool.completed":
    case "tool.error":
    case "hitl.interrupt":
    case "run.completed":
    case "run.cancelled":
    case "run.error":
      return value;
    default:
      return "unknown";
  }
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

  return {
    id: callId,
    name: toString(payload.toolName) || toString(payload.name) || "unknown_tool",
    args: toObject(payload.args),
    state,
    startedAt: toIso(rawEvent.timestamp),
    finishedAt: state === "pending" ? undefined : toIso(rawEvent.timestamp),
    errorMessage: toString(payload.errorMessage),
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

export async function cancelAgentRun(runId: string): Promise<void> {
  try {
    await axiosClient.post(`${AGENT_PREFIX}/runs/${runId}/cancel`, {});
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      await axiosClient.post(`/runs/${runId}/cancel`, {});
      return;
    }
    throw error;
  }
}

export async function resumeAgentRun(threadId: string, decision: string): Promise<void> {
  await axiosClient.post(`${AGENT_PREFIX}/runs/resume`, {
    threadId,
    decision,
  });
}

export async function startAgentRunStream(
  payload: StartAgentStreamInput,
  handlers: StartAgentStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  const baseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/$/, "");
  const token = getAccessToken();

  const requestInit: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal,
  };

  const streamUrls = [
    `${baseUrl}${AGENT_PREFIX}/runs/stream`,
    `${baseUrl}/runs/stream`,
  ];

  let response: Response | null = null;
  let lastStatus = 0;
  for (const url of streamUrls) {
    const nextResponse = await fetch(url, requestInit);
    if (nextResponse.ok && nextResponse.body) {
      response = nextResponse;
      break;
    }

    lastStatus = nextResponse.status;
    if (nextResponse.status === 401 || nextResponse.status === 403) {
      const raw = await nextResponse.text().catch(() => "");
      throw new Error(raw || `Stream request unauthorized (${nextResponse.status})`);
    }

    if (nextResponse.status !== 404) {
      const raw = await nextResponse.text().catch(() => "");
      throw new Error(raw || `Stream request failed with status ${nextResponse.status}`);
    }
  }

  if (!response || !response.body) {
    const nonStreamUrls = [
      `${baseUrl}${AGENT_PREFIX}/runs`,
      `${baseUrl}/runs`,
    ];

    for (const url of nonStreamUrls) {
      const fallbackResponse = await fetch(url, requestInit);
      if (fallbackResponse.status === 404) {
        continue;
      }

      if (!fallbackResponse.ok) {
        const raw = await fallbackResponse.text().catch(() => "");
        throw new Error(raw || `Run request failed with status ${fallbackResponse.status}`);
      }

      const result = (await fallbackResponse.json().catch(() => ({}))) as NormalRunResponse;
      const runId = payload.runId || `run-${Date.now()}`;
      const threadId = result.threadId || payload.threadId;
      const timestamp = new Date().toISOString();

      handlers.onEvent({
        name: "run.started",
        runId,
        threadId,
        timestamp,
        data: { status: "completed_non_stream" },
      });

      const stateValues = toObject(result.state?.values);
      const selectedTool = toString(stateValues.selected_tool) || toString(toObject(result.output).selected_tool);
      if (selectedTool) {
        handlers.onEvent({
          name: "tool.started",
          runId,
          threadId,
          timestamp,
          data: { toolName: selectedTool, name: selectedTool },
        });
        handlers.onEvent({
          name: "tool.completed",
          runId,
          threadId,
          timestamp,
          data: { toolName: selectedTool, name: selectedTool },
        });
      }

      const responseText = toString(stateValues.response_text) || toString(toObject(result.output).response_text);
      if (responseText) {
        handlers.onEvent({
          name: "message.chunk",
          runId,
          threadId,
          timestamp,
          data: { content: responseText },
        });
      }

      const interrupts = Array.isArray(result.interrupts) ? result.interrupts : [];
      for (const interrupt of interrupts) {
        handlers.onEvent({
          name: "hitl.interrupt",
          runId,
          threadId,
          timestamp,
          data: toObject(interrupt),
        });
      }

      handlers.onEvent({
        name: "run.completed",
        runId,
        threadId,
        timestamp,
        data: { status: result.status || "completed" },
      });
      return;
    }

    throw new Error(`Stream endpoint not found (last status ${lastStatus || 404})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const processFrame = (frame: string) => {
    const lines = frame.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return;

    let eventName = "unknown";
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (dataLines.length === 0) return;

    try {
      const parsed = JSON.parse(dataLines.join("\n")) as StreamEnvelope;
      const resolvedName = normalizeEventName(parsed.eventType || eventName);
      handlers.onEvent({
        name: resolvedName,
        runId: parsed.runId,
        threadId: parsed.threadId,
        timestamp: toIso(parsed.timestamp),
        data: toObject(parsed.data),
      });
    } catch {
      handlers.onEvent({
        name: normalizeEventName(eventName),
        timestamp: new Date().toISOString(),
        data: { raw: dataLines.join("\n") },
      });
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    let frameBreak = buffer.indexOf("\n\n");
    while (frameBreak >= 0) {
      const frame = buffer.slice(0, frameBreak);
      processFrame(frame);
      buffer = buffer.slice(frameBreak + 2);
      frameBreak = buffer.indexOf("\n\n");
    }
  }

  if (buffer.trim()) {
    processFrame(buffer);
  }
}
