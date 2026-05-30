import { Line, LineChart, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { AgentUICard } from "@/features/agent/types";

interface AgentUICardProps {
  card: AgentUICard;
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

export function AgentUICardView({ card }: AgentUICardProps) {
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
