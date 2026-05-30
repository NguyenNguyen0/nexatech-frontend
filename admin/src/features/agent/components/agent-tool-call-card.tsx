import { IconCircleCheck, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";
import type { AgentToolCall } from "@/features/agent/types";
import { cn } from "@/lib/utils";

interface AgentToolCallCardProps {
  toolCall: AgentToolCall;
}

export function AgentToolCallCard({ toolCall }: AgentToolCallCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-muted/30 p-3 text-xs")}> 
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="font-medium">Tool: {toolCall.name}</div>
        <div className="inline-flex items-center gap-1 text-muted-foreground">
          {toolCall.state === "pending" && <IconLoader2 size={14} className="animate-spin" />}
          {toolCall.state === "completed" && <IconCircleCheck size={14} className="text-emerald-600" />}
          {toolCall.state === "error" && <IconAlertTriangle size={14} className="text-destructive" />}
          <span>{toolCall.state}</span>
        </div>
      </div>
      <pre className="overflow-auto rounded bg-background px-2 py-1 text-[11px]">{JSON.stringify(toolCall.args, null, 2)}</pre>
      {toolCall.errorMessage && <p className="mt-1 text-destructive">{toolCall.errorMessage}</p>}
    </div>
  );
}
