import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { unwrapMcpResult } from "@/features/agent/lib/unwrap-mcp-result";

type ProductLike = {
  id?: string;
  name?: string;
  price?: number;
  primaryCategoryName?: string;
  categoryName?: string;
  category?: string;
  stockQuantity?: number;
  stockStatus?: string;
  stock?: number;
  slug?: string;
};

interface AgentProductCardProps {
  data: unknown;
}

function toProducts(data: unknown): ProductLike[] {
  const unwrapped = unwrapMcpResult(data);
  if (Array.isArray(unwrapped)) return unwrapped as ProductLike[];
  if (typeof unwrapped === "object" && unwrapped !== null) {
    const record = unwrapped as Record<string, unknown>;
    if (Array.isArray(record.content)) return record.content as ProductLike[];
    if (Array.isArray(record.items)) return record.items as ProductLike[];
    if (Array.isArray(record.products)) return record.products as ProductLike[];
    if (record.id || record.name) return [record as ProductLike];
  }
  return [];
}

export function AgentProductCard({ data }: AgentProductCardProps) {
  const products = toProducts(data).slice(0, 8);

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs">Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {products.length === 0 && <p className="text-xs text-muted-foreground">No product data.</p>}
        {products.map((product, index) => (
          <div key={`${product.id ?? product.slug ?? index}`} className="rounded-md border bg-background px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-medium">{product.name ?? product.slug ?? "Unknown product"}</p>
              {typeof product.price === "number" && (
                <Badge variant="secondary" className="text-[10px]">
                  {product.price.toLocaleString("vi-VN")} VND
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {(product.primaryCategoryName || product.categoryName || product.category) && (
                <span>{product.primaryCategoryName ?? product.categoryName ?? product.category}</span>
              )}
              {typeof (product.stockQuantity ?? product.stock) === "number" && (
                <span>Stock: {product.stockQuantity ?? product.stock}</span>
              )}
              {product.stockStatus && <span>{product.stockStatus}</span>}
              {product.id && <span>ID: {product.id}</span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
