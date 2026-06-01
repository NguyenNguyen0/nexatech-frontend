import { useMemo, useState } from "react";
import {
  IconCircleCheck,
  IconLoader2,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import type { AgentToolCall } from "@/features/agent/types";
import { cn } from "@/lib/utils";

// ── card ───────────────────────────────────────────────────────────────────────

interface AgentToolCallCardProps {
  toolCall: AgentToolCall;
}

export function AgentToolCallCard({ toolCall }: AgentToolCallCardProps) {
  const isPending = toolCall.state === "pending";
  const isCompleted = toolCall.state === "completed";
  const isError = toolCall.state === "error";

  // Pending calls start expanded so args are immediately visible.
  // Once completed the card auto-collapses; user can still click to expand.
  // We track the last-seen state so the auto-collapse only fires once on transition.
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const [seenState, setSeenState] = useState(toolCall.state);

  let expanded: boolean;
  if (manualExpanded !== null) {
    // User has explicitly clicked — honour their preference
    expanded = manualExpanded;
  } else {
    // Auto-rules: pending = open, completed/error = closed
    expanded = isPending;
  }

  // When the state changes (pending → completed), reset to auto-rule
  // and clear any manual override so the card auto-collapses.
  if (seenState !== toolCall.state) {
    setSeenState(toolCall.state);
    setManualExpanded(null);   // triggers re-render; expanded will re-evaluate
  }

  const hasArgs = useMemo(
    () => Object.keys(toolCall.args ?? {}).length > 0,
    [toolCall.args],
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border text-xs transition-colors duration-200",
        isPending && "border-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.06]",
        isCompleted && "border-emerald-600/30 bg-emerald-600/[0.04] dark:bg-emerald-600/[0.06]",
        isError && "border-destructive/40 bg-destructive/[0.04]",
      )}
    >
      {/* ── header (always visible) ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setManualExpanded((v) => (v === null ? !expanded : !v))}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {/* State icon */}
        {isPending && (
          <IconLoader2
            size={13}
            className="shrink-0 animate-spin text-amber-500"
          />
        )}
        {isCompleted && (
          <IconCircleCheck size={13} className="shrink-0 text-emerald-600" />
        )}
        {isError && (
          <IconAlertTriangle size={13} className="shrink-0 text-destructive" />
        )}

        {/* Tool name */}
        <code
          className={cn(
            "flex-1 truncate font-mono text-[11px] font-semibold",
            isPending && "text-amber-700 dark:text-amber-400",
            isCompleted && "text-foreground/80",
            isError && "text-destructive",
          )}
        >
          {toolCall.name}
        </code>

        {/* State label */}
        <span
          className={cn(
            "shrink-0 text-[10px] font-medium",
            isPending && "text-amber-600 dark:text-amber-500",
            isCompleted && "text-emerald-600 dark:text-emerald-400",
            isError && "text-destructive",
          )}
        >
          {isPending ? "running…" : isCompleted ? "done" : "error"}
        </span>

        {/* Expand/collapse chevron */}
        {expanded ? (
          <IconChevronDown size={12} className="shrink-0 text-muted-foreground/60" />
        ) : (
          <IconChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
        )}
      </button>

      {/* ── expandable developer body (args, results, error) ────────────────────────── */}
      {expanded && (
        <div className="space-y-2.5 border-t border-border/40 px-3 pb-3 pt-2 bg-muted/10">
          {/* Args */}
          {hasArgs && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Arguments
              </p>
              <pre className="overflow-auto rounded-md bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed">
                {JSON.stringify(toolCall.args, null, 2)}
              </pre>
            </div>
          )}

          {/* Raw result (only visible when expanded) */}
          {isCompleted && toolCall.result !== undefined && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Result (Raw)
              </p>
              <pre className="overflow-auto rounded-md bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                {JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}

          {/* Error details */}
          {isError && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                Error
              </p>
              <pre className="overflow-auto rounded-md bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-destructive bg-destructive/[0.02]">
                {JSON.stringify(
                  toolCall.error ?? toolCall.errorMessage ?? "Unknown error",
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
