import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, XAxis } from "recharts";
import { Button } from "@/components/custom/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type {
  AgentHitlActionRequest,
  AgentHitlDecisionInput,
  AgentHitlPayload,
  AgentHitlReviewConfig,
  AgentUICard,
} from "@/features/agent/types";

interface AgentUICardProps {
  card: AgentUICard;
  onHitlDecision?: (card: AgentUICard, decision: AgentHitlDecisionInput) => void;
}

const chartConfig: ChartConfig = {
  value: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
};

type ChartPayload = {
  labels?: string[];
  points?: number[];
};

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) return value as Record<string, unknown>;
  return {};
}

function parseHitlPayload(payload: unknown): AgentHitlPayload {
  const root = toRecord(payload);
  const interrupt = toRecord(root.interrupt);
  const interruptValue = toRecord(interrupt.value);
  const nestedPayload = toRecord(interruptValue.payload);

  const source = Object.keys(interruptValue).length > 0 ? interruptValue : nestedPayload;
  const actionRequests = Array.isArray(source.actionRequests)
    ? (source.actionRequests as AgentHitlActionRequest[])
    : [];
  const reviewConfigs = Array.isArray(source.reviewConfigs)
    ? (source.reviewConfigs as AgentHitlReviewConfig[])
    : [];
  const firstReview = reviewConfigs[0] ?? {};

  const expiresAt = typeof source.expiresAt === "string"
    ? source.expiresAt
    : typeof root.expires_at === "string"
      ? root.expires_at
      : typeof firstReview.expiresAt === "string"
        ? firstReview.expiresAt
        : undefined;

  const timeoutSeconds = typeof source.timeoutSeconds === "number"
    ? source.timeoutSeconds
    : typeof root.timeout_seconds === "number"
      ? root.timeout_seconds
      : typeof firstReview.timeoutSeconds === "number"
        ? firstReview.timeoutSeconds
        : undefined;

  const threadId = typeof source.threadId === "string"
    ? source.threadId
    : typeof root.threadId === "string"
      ? root.threadId
      : undefined;

  const approvalRequestId = typeof source.approvalRequestId === "string"
    ? source.approvalRequestId
    : typeof root.approval_request_id === "string"
      ? String(root.approval_request_id)
      : undefined;

  return {
    actionRequests,
    reviewConfigs,
    approvalRequestId,
    threadId,
    timeoutSeconds,
    expiresAt,
    raw: root,
  };
}

function getRemainingSeconds(expiresAt?: string): number | null {
  if (!expiresAt) return null;
  const expiry = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiry)) return null;
  return Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
}

export function AgentUICardView({ card, onHitlDecision }: AgentUICardProps) {
  if (card.type === "chart") {
    const payload = (card.payload ?? {}) as ChartPayload;
    const labels = payload.labels ?? [];
    const points = payload.points ?? [];
    const data = labels.map((label, index) => ({ label, value: points[index] ?? 0 }));

    return (
      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{card.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-36 w-full">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  if (card.type === "hitl") {
    return <HitlCard card={card} onHitlDecision={onHitlDecision} />;
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{card.title}</CardTitle>
          <Badge variant="secondary">{card.type}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{card.description}</p>
      </CardHeader>
      <CardContent>
        <pre className="overflow-auto rounded-md bg-muted px-3 py-2 text-[11px] leading-relaxed">
          {JSON.stringify(card.payload ?? {}, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

function HitlCard({ card, onHitlDecision }: AgentUICardProps) {
  const hitlPayload = parseHitlPayload(card.payload);
  const actionRequest = hitlPayload.actionRequests[0];
  const reviewConfig = hitlPayload.reviewConfigs[0] ?? {};
  const allowedDecisions = (reviewConfig.allowedDecisions ?? ["approve", "reject", "edit"]).map((value) => value.toLowerCase());

  const [reason, setReason] = useState("");
  const [editedArgsText, setEditedArgsText] = useState(
    JSON.stringify(actionRequest?.args ?? {}, null, 2),
  );
  const [editedArgsError, setEditedArgsError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() => getRemainingSeconds(hitlPayload.expiresAt));

  useEffect(() => {
    setEditedArgsText(JSON.stringify(actionRequest?.args ?? {}, null, 2));
    setEditedArgsError(null);
  }, [actionRequest?.id]);

  useEffect(() => {
    if (!hitlPayload.expiresAt) {
      setRemainingSeconds(null);
      return;
    }
    const update = () => setRemainingSeconds(getRemainingSeconds(hitlPayload.expiresAt));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [hitlPayload.expiresAt]);

  const timeoutLabel = useMemo(() => {
    if (remainingSeconds === null) return null;
    return `${remainingSeconds}s`;
  }, [remainingSeconds]);

  const handleApprove = () => {
    onHitlDecision?.(card, { decision: "approved", reason: reason.trim() || undefined });
  };

  const handleReject = () => {
    onHitlDecision?.(card, { decision: "rejected", reason: reason.trim() || undefined });
  };

  const handleEdit = () => {
    try {
      const parsed = JSON.parse(editedArgsText) as Record<string, unknown>;
      setEditedArgsError(null);
      onHitlDecision?.(card, {
        decision: "edited",
        modifiedArgs: parsed,
        reason: reason.trim() || undefined,
      });
    } catch {
      setEditedArgsError("Edited args must be valid JSON.");
    }
  };

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{card.title}</CardTitle>
          <Badge variant="secondary">hitl</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{card.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {hitlPayload.approvalRequestId && <span>Approval: {hitlPayload.approvalRequestId}</span>}
          {timeoutLabel && <span>Timeout in {timeoutLabel}</span>}
          {typeof hitlPayload.timeoutSeconds === "number" && <span>Window {hitlPayload.timeoutSeconds}s</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 rounded-md bg-muted px-3 py-2 text-[11px] leading-relaxed">
          <p className="font-medium">Action</p>
          <p>{actionRequest?.description ?? actionRequest?.action ?? "Pending approval"}</p>
          <pre className="mt-2 overflow-auto rounded bg-background px-2 py-1">
            {JSON.stringify(actionRequest?.args ?? {}, null, 2)}
          </pre>
        </div>

        <div className="mb-3 space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground" htmlFor={`hitl-reason-${card.id}`}>
            Reason
          </label>
          <textarea
            id={`hitl-reason-${card.id}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="h-16 w-full rounded-md border bg-background px-2 py-1 text-xs"
            placeholder="Optional note for approve/reject/edit"
          />
        </div>

        {allowedDecisions.includes("edit") && (
          <div className="mb-3 space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground" htmlFor={`hitl-args-${card.id}`}>
              Edited args (JSON)
            </label>
            <textarea
              id={`hitl-args-${card.id}`}
              value={editedArgsText}
              onChange={(event) => setEditedArgsText(event.target.value)}
              className="h-32 w-full rounded-md border bg-background px-2 py-1 font-mono text-[11px]"
            />
            {editedArgsError && <p className="text-[11px] text-destructive">{editedArgsError}</p>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {allowedDecisions.includes("approve") && (
            <Button type="button" size="sm" onClick={handleApprove}>
              Approve
            </Button>
          )}
          {allowedDecisions.includes("reject") && (
            <Button type="button" size="sm" variant="outline" onClick={handleReject}>
              Reject
            </Button>
          )}
          {allowedDecisions.includes("edit") && (
            <Button type="button" size="sm" variant="secondary" onClick={handleEdit}>
              Edit & Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
