import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgentJsonFallbackProps {
  title: string;
  value: unknown;
}

export function AgentJsonFallback({ title, value }: AgentJsonFallbackProps) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="overflow-auto rounded-md bg-muted px-3 py-2 text-[11px] leading-relaxed">
          {JSON.stringify(value ?? {}, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
