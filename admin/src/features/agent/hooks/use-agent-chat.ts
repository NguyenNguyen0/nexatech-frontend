import { useMemo, useCallback } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { v4 as uuidv4 } from "uuid";
import type { Message, AssistantMessage, ToolMessage, UserMessage } from "@ag-ui/core";
import type { AgentChatMessage, AgentToolCall } from "@/features/agent/types";

// ── AG-UI type guards ──────────────────────────────────────────────────────────

function isAssistantMessage(msg: Message): msg is AssistantMessage {
  return msg.role === "assistant";
}

function isUserMessage(msg: Message): msg is UserMessage {
  return msg.role === "user";
}

function isToolMessage(msg: Message): msg is ToolMessage {
  return msg.role === "tool";
}

// ── helpers ───────────────────────────────────────────────────────────────────

function parseJsonSafe(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/**
 * Convert AG-UI `Message[]` (from `agent.messages`) into `AgentChatMessage[]`.
 *
 * AG-UI AssistantMessage.toolCalls shape:
 *   { id: string; type: "function"; function: { name: string; arguments: string } }[]
 *
 * AG-UI ToolMessage shape:
 *   { id: string; role: "tool"; content: string; toolCallId: string }
 */
export function deriveAgentMessages(messages: ReadonlyArray<Readonly<Message>>): AgentChatMessage[] {
  // Pass 1 — index ToolMessage results by toolCallId
  const toolResultMap = new Map<string, { content: unknown; completedAt: string }>();
  for (const msg of messages) {
    if (isToolMessage(msg) && msg.toolCallId) {
      toolResultMap.set(msg.toolCallId, {
        content: parseJsonSafe(msg.content ?? ""),
        completedAt: new Date().toISOString(),
      });
    }
  }

  // Pass 2 — build AgentChatMessage list from user + assistant messages
  const result: AgentChatMessage[] = [];
  const now = new Date().toISOString();

  for (const msg of messages) {
    if (isUserMessage(msg)) {
      const content =
        typeof msg.content === "string"
          ? msg.content
          : Array.isArray(msg.content)
            ? (msg.content as { type?: string; text?: string }[])
                .map((c) => c.text ?? "")
                .join("")
            : "";

      result.push({
        id: msg.id,
        role: "user",
        content,
        createdAt: now,
      });
      continue;
    }

    if (isAssistantMessage(msg)) {
      const textContent = msg.content ?? "";

      const toolCalls: AgentToolCall[] = (msg.toolCalls ?? []).map((tc) => {
        const toolResult = toolResultMap.get(tc.id);
        return {
          id: tc.id,
          name: tc.function.name,
          args: parseJsonSafe(tc.function.arguments) as Record<string, unknown>,
          state: toolResult ? "completed" : "pending",
          startedAt: now,
          completedAt: toolResult?.completedAt,
          result: toolResult?.content,
        };
      });

      result.push({
        id: msg.id,
        role: "assistant",
        content: textContent,
        createdAt: now,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        isStreaming: false,
      });
    }
  }

  return result;
}

// ── exported types ─────────────────────────────────────────────────────────────

/** Flat tool-call view used by the legacy SSE bridge path. */
export type RenderedToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  state: "pending" | "completed" | "error";
  startedAt: string;
  completedAt?: string;
};

export interface UseAgentChatResult {
  /** AG-UI messages mapped to AgentChatMessage for direct rendering. */
  derivedMessages: AgentChatMessage[];
  /** Concatenated text from the last assistant message (legacy bridge). */
  latestAssistantText: string;
  /** Flat list of all tool calls across messages. */
  toolCalls: RenderedToolCall[];
  /** Send a user message and run the agent. */
  sendMessage: (content: string) => Promise<void>;
  /** Abort the current run. */
  stopGeneration: () => void;
  /** Whether the agent is currently running. */
  isLoading: boolean;
  /** Whether the CopilotKit provider is available. */
  isReady: boolean;
}

// ── inner hook that must always be called inside CopilotKitProvider ────────────

function useAgentChatInner(): UseAgentChatResult {
  const agentId = import.meta.env.VITE_AGUI_AGENT_NAME || "nexatech_agent";
  const { agent } = useAgent({ agentId });

  const rawMessages = agent.messages as ReadonlyArray<Readonly<Message>>;

  const derivedMessages = useMemo(
    () => deriveAgentMessages(rawMessages),
    [rawMessages],
  );

  const latestAssistantText = useMemo(() => {
    for (let i = derivedMessages.length - 1; i >= 0; i -= 1) {
      const msg = derivedMessages[i];
      if (msg.role === "assistant" && msg.content.trim()) {
        return msg.content;
      }
    }
    return "";
  }, [derivedMessages]);

  const toolCalls = useMemo<RenderedToolCall[]>(() => {
    const calls: RenderedToolCall[] = [];
    for (const msg of derivedMessages) {
      if (msg.role === "assistant" && msg.toolCalls) {
        for (const tc of msg.toolCalls) {
          calls.push({
            id: tc.id,
            name: tc.name,
            args: tc.args,
            result: tc.result,
            state: tc.state,
            startedAt: tc.startedAt,
            completedAt: tc.completedAt,
          });
        }
      }
    }
    return calls;
  }, [derivedMessages]);

  const isLoading = agent.isRunning;

  const sendMessage = useCallback(
    async (content: string) => {
      agent.addMessage({
        id: uuidv4(),
        role: "user",
        content,
      } as Message);
      await agent.runAgent();
    },
    [agent],
  );

  const stopGeneration = useCallback(() => {
    agent.abortRun();
  }, [agent]);

  return {
    derivedMessages,
    latestAssistantText,
    toolCalls,
    sendMessage,
    isLoading,
    stopGeneration,
    isReady: true,
  };
}



// ── public hook ────────────────────────────────────────────────────────────────

/**
 * Wraps `useAgent` from CopilotKit and provides a safe fallback when rendered
 * outside a `<CopilotKitProvider>`.
 *
 * This hook must be rendered inside `<AgentPageAguiContent>` which is always
 * wrapped in a `<CopilotKitProvider>`. The fallback path exists only as a
 * type-safety guard.
 */
export function useAgentChat(): UseAgentChatResult {
  return useAgentChatInner();
}
