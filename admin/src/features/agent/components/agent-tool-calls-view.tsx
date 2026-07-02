// File has internal component-shaped helpers (CollapsibleToolCallsView,
// AssistantMessageWithCollapsedToolCalls) alongside the one exported
// composite — splitting each into its own file for HMR reliability would
// be overkill for one small, cohesive feature.
/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { IconChevronDown, IconChevronUp, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import {
  CopilotChatAssistantMessage,
  useRenderToolCall,
  type CopilotChatAssistantMessageProps,
  type CopilotChatToolCallsViewProps,
} from "@copilotkit/react-core/v2";
import { cn } from "@/lib/utils";

/**
 * Replaces CopilotChatAssistantMessage's default toolCallsView: instead of
 * showing each tool call inline immediately, groups them under one
 * "Đang gọi tool..." row while any are still running, then auto-collapses
 * to "Đã gọi N tool" once the whole batch finishes — the generative UI
 * (via useRenderToolCall, same registry as before) stays reachable by
 * expanding the row, but the final answer text becomes the focus once
 * tools are done (matches the Claude-style collapsed tool-step pattern).
 */
function CollapsibleToolCallsView({ message, messages }: CopilotChatToolCallsViewProps) {
  const renderToolCall = useRenderToolCall();
  const toolCalls = message.toolCalls ?? [];
  const toolMessageById = new Map(
    (messages ?? [])
      .filter((candidate) => candidate.role === "tool")
      .map((candidate) => [candidate.toolCallId, candidate] as const),
  );
  const allComplete = toolCalls.length > 0 && toolCalls.every((toolCall) => toolMessageById.has(toolCall.id));

  // Adjust `expanded` when `allComplete` flips, without an effect — React's
  // documented pattern for "state derived from a prop change" (setState
  // during render is safe here since it happens before commit; it's the
  // useEffect-based version of this that causes an extra render pass).
  const [expanded, setExpanded] = useState(true);
  const [wasComplete, setWasComplete] = useState(allComplete);
  if (allComplete !== wasComplete) {
    setWasComplete(allComplete);
    if (allComplete) setExpanded(false);
  }

  if (toolCalls.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {allComplete ? (
          <IconCircleCheck size={14} className="text-emerald-600" />
        ) : (
          <IconLoader2 size={14} className="animate-spin" />
        )}
        <span>{allComplete ? `Đã gọi ${toolCalls.length} tool` : "Đang gọi tool..."}</span>
        {expanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
      </button>

      <div className={cn("space-y-2 border-l-2 border-border/60 pl-3", !expanded && "hidden")}>
        {toolCalls.map((toolCall) => (
          <div key={toolCall.id}>{renderToolCall({ toolCall, toolMessage: toolMessageById.get(toolCall.id) })}</div>
        ))}
      </div>
    </div>
  );
}

function AssistantMessageWithCollapsedToolCalls(props: CopilotChatAssistantMessageProps) {
  return <CopilotChatAssistantMessage {...props} toolCallsView={CollapsibleToolCallsView} />;
}

// The `assistantMessage` slot type is `typeof CopilotChatAssistantMessage`,
// which includes its static sub-components (MarkdownRenderer, Toolbar,
// etc.) alongside the callable signature — copy them onto the wrapper so
// the type lines up (none of them are overridden here, just forwarded).
export const AgentAssistantMessage = Object.assign(
  AssistantMessageWithCollapsedToolCalls,
  CopilotChatAssistantMessage,
);
