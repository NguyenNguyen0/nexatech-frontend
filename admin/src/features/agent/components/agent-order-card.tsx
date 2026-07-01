import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { unwrapMcpResult } from "@/features/agent/lib/unwrap-mcp-result";

type OrderLike = {
  id?: string;
  orderId?: string;
  status?: string;
  total?: number;
  totalAmount?: number;
  customerName?: string;
};

interface AgentOrderCardProps {
  data: unknown;
}

function toOrders(data: unknown): OrderLike[] {
  const unwrapped = unwrapMcpResult(data);
  if (Array.isArray(unwrapped)) return unwrapped as OrderLike[];
  if (typeof unwrapped === "object" && unwrapped !== null) {
    const record = unwrapped as Record<string, unknown>;
    if (Array.isArray(record.content)) return record.content as OrderLike[];
    if (Array.isArray(record.items)) return record.items as OrderLike[];
    if (Array.isArray(record.orders)) return record.orders as OrderLike[];
    if (record.id || record.orderId) return [record as OrderLike];
  }
  return [];
}

export function AgentOrderCard({ data }: AgentOrderCardProps) {
  const orders = toOrders(data).slice(0, 8);

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs">Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {orders.length === 0 && <p className="text-xs text-muted-foreground">No order data.</p>}
        {orders.map((order, index) => (
          <div key={`${order.id ?? order.orderId ?? index}`} className="rounded-md border bg-background px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-medium">{order.orderId ?? order.id ?? "Unknown order"}</p>
              {order.status && (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {order.status}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {typeof (order.totalAmount ?? order.total) === "number" && (
                <span>Total: {(order.totalAmount ?? order.total)?.toLocaleString("vi-VN")} VND</span>
              )}
              {order.customerName && <span>Customer: {order.customerName}</span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
