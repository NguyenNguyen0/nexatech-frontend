import { useMemo, useRef, useCallback } from "react";
import { useAgent } from "@copilotkit/react-core/v2/headless";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@ag-ui/core";

// ---- types ----------------------------------------------------------------

export type RuntimeMessage = Message & {
  role?: string;
  content?: unknown;
  tool_calls?: ToolCallEntry[];
  tool_call_id?: string;
  name?: string;
};

export type ToolCallEntry = {
  id: string;
  name: string;
  args: Record<string, unknown>;
};

export type RenderedToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  state: "pending" | "completed" | "error";
  startedAt: string;
  completedAt?: string;
};

// ---- helpers ----------------------------------------------------------------

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          const text = (item as Record<string, unknown>).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("");
  }
  if (typeof content === "object" && content !== null) {
    const maybeText = (content as Record<string, unknown>).text;
    if (typeof maybeText === "string") return maybeText;
  }
  return "";
}

function parseJson(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return raw; }
}

/**
 * Derive rendered tool calls from the raw messages list.
 * Pairs each AIMessage tool_call with its matching ToolMessage result.
 */
function deriveToolCalls(messages: RuntimeMessage[]): RenderedToolCall[] {
  const calls: RenderedToolCall[] = [];
  const resultMap = new Map<string, { content: unknown; completedAt: string }>();

  // Pass 1 — collect ToolMessage results
  for (const msg of messages) {
    if ((msg as RuntimeMessage).role === "tool" && msg.tool_call_id) {
      resultMap.set(msg.tool_call_id, {
        content: parseJson(contentToText(msg.content)),
        completedAt: (msg as Record<string, unknown>).created_at as string ?? new Date().toISOString(),
      });
    }
  }

  // Pass 2 — build call entries from AIMessage tool_calls
  for (const msg of messages) {
    if ((msg as RuntimeMessage).role !== "assistant") continue;
    const toolCalls = (msg as RuntimeMessage).tool_calls ?? [];
    for (const tc of toolCalls) {
      const result = resultMap.get(tc.id);
      calls.push({
        id: tc.id,
        name: tc.name,
        args: tc.args,
        result: result?.content,
        state: result ? "completed" : "pending",
        startedAt: (msg as Record<string, unknown>).created_at as string ?? new Date().toISOString(),
        completedAt: result?.completedAt,
      });
    }
  }

  return calls;
}

// ---- hook ------------------------------------------------------------------

export function useAgentChat(_threadId?: string) {
  const isReadyRef = useRef(false);

  try {
    const { agent } = useAgent();
    isReadyRef.current = true;

    const visibleMessages = agent.messages as RuntimeMessage[];

    const latestAssistantText = useMemo(() => {
      for (let i = visibleMessages.length - 1; i >= 0; i -= 1) {
        const msg = visibleMessages[i];
        if ((msg as RuntimeMessage).role === "assistant") {
          const text = contentToText(msg.content);
          if (text) return text;
        }
      }
      return "";
    }, [visibleMessages]);

    const toolCalls = useMemo(
      () => deriveToolCalls(visibleMessages),
      [visibleMessages],
    );

    const isLoading = agent.isRunning;

    const sendMessage = useCallback(async (content: string) => {
      agent.addMessage({
        id: uuidv4(),
        role: "user",
        content,
      } as Message);
      await agent.runAgent();
    }, [agent]);

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
      visibleMessages: [] as RuntimeMessage[],
      latestAssistantText: "",
      toolCalls: [] as RenderedToolCall[],
      sendMessage: async (_content: string) => undefined,
      isLoading: false,
      stopGeneration: () => undefined,
      isReady: false,
    };
  }
}
