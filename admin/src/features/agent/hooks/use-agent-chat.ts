/* eslint-disable react-hooks/rules-of-hooks -- useAgentChat is only ever
 * called from AgentPageAguiContent, which only mounts inside
 * CopilotKitProvider (see index.tsx). The try/catch below guards against
 * useAgent()/useRenderToolCall() throwing at that call site (e.g. agent not
 * yet registered), not against a missing provider — pre-existing pattern,
 * kept as-is rather than introducing an error boundary for this pass.
 */
import { useMemo, useCallback, type ReactElement } from "react";
import { useAgent } from "@copilotkit/react-core/v2/headless";
import { useRenderToolCall } from "@copilotkit/react-core/v2";
import { v4 as uuidv4 } from "uuid";
import type { AssistantMessage, Message, ToolMessage } from "@ag-ui/core";

// ---- types ----------------------------------------------------------------

export type RenderedToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  state: "pending" | "completed" | "error";
  /** Rendered via CopilotKitProvider's renderToolCalls registry (generative UI). */
  element: ReactElement | null;
};

export type AgentTurnResult = {
  text: string;
  toolCalls: RenderedToolCall[];
};

// ---- helpers ----------------------------------------------------------------

function latestAssistantTextFrom(messages: Message[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg.role === "assistant") return msg.content ?? "";
  }
  return "";
}

function safeParseArguments(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * Derive rendered tool calls from the raw AG-UI message list, pairing each
 * AssistantMessage.toolCalls entry with its matching ToolMessage result by
 * toolCallId. Field names here follow @ag-ui/core's real schema
 * (camelCase toolCalls/toolCallId, function.name/arguments) — not the
 * snake_case shape older code in this file assumed.
 */
function deriveToolCalls(
  messages: Message[],
  renderToolCall: (props: { toolCall: NonNullable<AssistantMessage["toolCalls"]>[number]; toolMessage?: ToolMessage }) => ReactElement | null,
): RenderedToolCall[] {
  const toolMessageById = new Map<string, ToolMessage>();
  for (const msg of messages) {
    if (msg.role === "tool") toolMessageById.set(msg.toolCallId, msg);
  }

  const calls: RenderedToolCall[] = [];
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const toolCall of msg.toolCalls ?? []) {
      const toolMessage = toolMessageById.get(toolCall.id);
      calls.push({
        id: toolCall.id,
        name: toolCall.function.name,
        args: safeParseArguments(toolCall.function.arguments),
        result: toolMessage?.content,
        state: !toolMessage ? "pending" : toolMessage.error ? "error" : "completed",
        element: renderToolCall({ toolCall, toolMessage }),
      });
    }
  }

  return calls;
}

// ---- hook ------------------------------------------------------------------

export function useAgentChat() {
  try {
    const { agent } = useAgent();
    const renderToolCall = useRenderToolCall();

    const visibleMessages = agent.messages;

    const latestAssistantText = useMemo(
      () => latestAssistantTextFrom(visibleMessages),
      [visibleMessages],
    );

    const toolCalls = useMemo(
      () => deriveToolCalls(visibleMessages, renderToolCall),
      [visibleMessages, renderToolCall],
    );

    const isLoading = agent.isRunning;

    // Returns the result derived from runAgent()'s own `newMessages`, not
    // the reactive `latestAssistantText`/`toolCalls` above — those are
    // memoized against this render's `visibleMessages` and would be stale
    // by the time this async function resolves (a later render replaces
    // them with fresh values, but this closure still points at the old
    // ones). Callers that need the live view during streaming should read
    // the hook's `latestAssistantText`/`toolCalls` fields directly instead.
    const sendMessage = useCallback(
      async (content: string): Promise<AgentTurnResult> => {
        agent.addMessage({
          id: uuidv4(),
          role: "user",
          content,
        } as Message);
        const { newMessages } = await agent.runAgent();

        return {
          text: latestAssistantTextFrom(newMessages),
          toolCalls: deriveToolCalls(newMessages, renderToolCall),
        };
      },
      [agent, renderToolCall],
    );

    const stopGeneration = useCallback(() => {
      agent.abortRun();
    }, [agent]);

    return {
      visibleMessages,
      latestAssistantText,
      toolCalls,
      sendMessage,
      isLoading,
      stopGeneration,
      isReady: true,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[AgentChat] CopilotKit unavailable, fallback to SSE", error);
    }

    return {
      visibleMessages: [] as Message[],
      latestAssistantText: "",
      toolCalls: [] as RenderedToolCall[],
      sendMessage: async (): Promise<AgentTurnResult> => ({ text: "", toolCalls: [] }),
      isLoading: false,
      stopGeneration: () => undefined,
      isReady: false,
    };
  }
}
