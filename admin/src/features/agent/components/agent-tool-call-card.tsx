import { useEffect, useMemo, useState } from "react";
import { IconCircleCheck, IconLoader2, IconAlertTriangle, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import dayjs from "dayjs";
import { AgentInventoryTable } from "@/features/agent/components/agent-inventory-table";
import { AgentJsonFallback } from "@/features/agent/components/agent-json-fallback";
import { AgentOrderCard } from "@/features/agent/components/agent-order-card";
import { AgentProductCard } from "@/features/agent/components/agent-product-card";
import type { AgentToolCall } from "@/features/agent/types";
import { cn } from "@/lib/utils";

interface AgentToolCallCardProps {
  toolCall: AgentToolCall;
}

export function AgentToolCallCard({ toolCall }: AgentToolCallCardProps) {
  const [expanded, setExpanded] = useState(toolCall.state === "pending");
  const isError = toolCall.state === "error";
  const failedSummary = `Call ${toolCall.name} tool failed with status code ${toolCall.statusCode ?? "unknown"}`;
  const statusLabel =
    toolCall.state === "pending" ? "pending" : toolCall.state === "completed" ? "completed" : "error";

  useEffect(() => {
    if (toolCall.state === "pending") setExpanded(true);
    if (toolCall.state === "completed") setExpanded(false);
  }, [toolCall.state]);

  const resultView = useMemo(() => {
    if (toolCall.result === undefined) return null;
    const lowerName = toolCall.name.toLowerCase();

    if (lowerName.includes("product")) {
      return <AgentProductCard data={toolCall.result} />;
    }

    if (lowerName.includes("order")) {
      return <AgentOrderCard data={toolCall.result} />;
    }

    if (lowerName.includes("inventory") || lowerName.includes("stock")) {
      return <AgentInventoryTable data={toolCall.result} />;
    }

    return <AgentJsonFallback title="Tool result" value={toolCall.result} />;
  }, [toolCall.name, toolCall.result]);

  return (
    <div className={cn("rounded-lg border border-border bg-muted/30 text-xs")}> 
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          {toolCall.state === "pending" && <IconLoader2 size={14} className="shrink-0 animate-spin" />}
          {toolCall.state === "completed" && <IconCircleCheck size={14} className="shrink-0 text-emerald-600" />}
          {toolCall.state === "error" && <IconAlertTriangle size={14} className="shrink-0 text-destructive" />}
          <span className="truncate font-medium">{toolCall.name}</span>
        </div>
        <div className="inline-flex items-center gap-1 text-muted-foreground">
          <span>{statusLabel}</span>
          {expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="space-y-2 border-t px-3 py-2">
          <div className="grid gap-1 text-[11px] text-muted-foreground md:grid-cols-2">
            <span>Started: {dayjs(toolCall.startedAt).format("DD/MM HH:mm:ss")}</span>
            <span>
              Completed: {toolCall.completedAt || toolCall.finishedAt
                ? dayjs(toolCall.completedAt || toolCall.finishedAt).format("DD/MM HH:mm:ss")
                : "-"}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">Args</p>
            <pre className="overflow-auto rounded bg-background px-2 py-1 text-[11px]">{JSON.stringify(toolCall.args, null, 2)}</pre>
          </div>

          {toolCall.result !== undefined && (
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Result</p>
              {resultView}
            </div>
          )}

          {isError && (
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-destructive">Error</p>
              <p className="text-destructive">{failedSummary}</p>
              <pre className="overflow-auto rounded bg-background px-2 py-1 text-[11px] text-destructive">
                {JSON.stringify(toolCall.error ?? toolCall.errorMessage ?? {}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
