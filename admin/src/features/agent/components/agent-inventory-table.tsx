import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StockLike = {
  productId?: string;
  productName?: string;
  sku?: string;
  available?: number;
  reserved?: number;
  warehouse?: string;
};

interface AgentInventoryTableProps {
  data: unknown;
}

function toRows(data: unknown): StockLike[] {
  if (Array.isArray(data)) return data as StockLike[];
  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as StockLike[];
    if (Array.isArray(record.inventory)) return record.inventory as StockLike[];
    if (record.productId || record.sku) return [record as StockLike];
  }
  return [];
}

export function AgentInventoryTable({ data }: AgentInventoryTableProps) {
  const rows = toRows(data).slice(0, 10);

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs">Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">No inventory data.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[420px] text-left text-[11px]">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-2 py-1.5 font-medium">Product</th>
                  <th className="px-2 py-1.5 font-medium">SKU</th>
                  <th className="px-2 py-1.5 font-medium">Available</th>
                  <th className="px-2 py-1.5 font-medium">Reserved</th>
                  <th className="px-2 py-1.5 font-medium">Warehouse</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.productId ?? row.sku ?? index}`} className="border-b last:border-b-0">
                    <td className="px-2 py-1.5">{row.productName ?? row.productId ?? "Unknown"}</td>
                    <td className="px-2 py-1.5">{row.sku ?? "-"}</td>
                    <td className="px-2 py-1.5">{typeof row.available === "number" ? row.available : "-"}</td>
                    <td className="px-2 py-1.5">{typeof row.reserved === "number" ? row.reserved : "-"}</td>
                    <td className="px-2 py-1.5">{row.warehouse ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
