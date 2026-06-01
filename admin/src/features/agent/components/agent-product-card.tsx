import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/custom/button";
import { toast } from "sonner";
import {
  IconCpu,
  IconDeviceDesktop,
  IconPackage,
  IconFlame,
  IconAlertCircle,
  IconCircleCheck,
  IconEye,
  IconEdit
} from "@tabler/icons-react";

type ProductLike = {
  id?: string;
  name?: string;
  price?: number;
  compareAtPrice?: number;
  categoryName?: string;
  category?: string;
  stock?: number;
  sku?: string;
  slug?: string;
  thumbnail?: string;
  inventoryStatus?: "IN_STOCK" | "OUT_OF_STOCK";
  specs?: Record<string, string>;
  featured?: boolean;
};

interface AgentProductCardProps {
  data: unknown;
}

function toProducts(data: unknown): ProductLike[] {
  if (!data) return [];

  const extractFromPayload = (payload: unknown): ProductLike[] => {
    if (Array.isArray(payload)) return payload as ProductLike[];
    if (typeof payload === "object" && payload !== null) {
      const record = payload as Record<string, unknown>;
      
      // Look for list wrappers
      if (Array.isArray(record.content)) return record.content as ProductLike[];
      if (Array.isArray(record.items)) return record.items as ProductLike[];
      if (Array.isArray(record.products)) return record.products as ProductLike[];
      
      // Look for a single product
      if (record.id || record.name || record.sku || record.slug) {
        return [record as ProductLike];
      }
    }
    return [];
  };

  // If it's a ToolResult envelope (has success: boolean and data field)
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    
    // Check if it's the outer ToolResult envelope
    if ("success" in obj && "data" in obj) {
      const innerData = obj.data;
      const res = extractFromPayload(innerData);
      if (res.length > 0) return res;
    }

    // Direct extraction
    const res = extractFromPayload(data);
    if (res.length > 0) return res;
  }

  return [];
}

export function AgentProductCard({ data }: AgentProductCardProps) {
  const products = toProducts(data).slice(0, 8);

  const formatPrice = (price?: number) => {
    if (typeof price !== "number") return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (products.length === 0) {
    return (
      <Card className="border-border/60 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <IconAlertCircle className="mb-2 h-8 w-8 text-muted-foreground/60" />
          <p className="text-xs text-muted-foreground font-medium">Không tìm thấy thông tin sản phẩm.</p>
        </CardContent>
      </Card>
    );
  }

  // Showcase layout for a single product
  if (products.length === 1) {
    const product = products[0];
    const isOutOfStock = product.inventoryStatus === "OUT_OF_STOCK" || product.stock === 0;

    return (
      <div className="glass-card rounded-xl border border-border/80 shadow-card overflow-hidden w-full max-w-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <div className="flex flex-col md:flex-row">
          {/* Product Thumbnail / Placeholder */}
          <div className="relative md:w-48 w-full h-48 md:h-auto bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-border/60">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name ?? "Product image"}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12),transparent_70%)]" />
                <IconDeviceDesktop size={44} className="stroke-[1.5] animate-pulse" />
                <span className="mt-2 text-[9px] uppercase tracking-wider text-muted-foreground">NexaTech Hardware</span>
              </div>
            )}

            {/* Badges on Image */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {product.featured && (
                <Badge className="bg-amber-500/90 text-slate-950 hover:bg-amber-500 flex items-center gap-1 text-[9px] font-semibold py-0.5 px-2 uppercase shadow-sm backdrop-blur-sm border-none">
                  <IconFlame size={10} className="fill-current" /> Hot
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  {product.sku ?? "No SKU"}
                </span>
                
                {isOutOfStock ? (
                  <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-semibold py-0.5 px-2 flex items-center gap-1">
                    <IconAlertCircle size={10} /> Hết Hàng
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10 text-[9px] font-semibold py-0.5 px-2 flex items-center gap-1">
                    <IconCircleCheck size={10} /> Còn Hàng {typeof product.stock === "number" ? `(${product.stock})` : ""}
                  </Badge>
                )}
              </div>

              <h4 className="text-sm font-bold tracking-tight text-foreground leading-snug line-clamp-2">
                {product.name ?? product.slug ?? "Sản phẩm NexaTech"}
              </h4>

              {/* Price Container */}
              <div className="flex items-baseline gap-2 pt-1">
                {typeof product.price === "number" && (
                  <span className="text-base font-extrabold text-primary tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                )}
                {typeof product.compareAtPrice === "number" && product.compareAtPrice > (product.price ?? 0) && (
                  <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/60">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Specs (if available) */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <IconCpu size={10} /> Thông số kỹ thuật
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <Badge
                        key={key}
                        variant="outline"
                        className="text-[9px] py-0.5 px-1.5 bg-muted/30 border-border/50 text-foreground/80 font-medium"
                      >
                        <span className="text-muted-foreground mr-1 capitalize">{key}:</span>
                        {String(val)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[11px] h-8 border-border/80 hover:bg-muted/40"
                leftSection={<IconEye size={12} />}
                onClick={() => {
                  if (product.slug) {
                    window.open(`http://localhost:3000/product/${product.slug}`, "_blank");
                  }
                }}
              >
                Storefront
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 text-[11px] h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                leftSection={<IconEdit size={12} />}
                onClick={() => {
                  toast.success(`Chuyển hướng chỉnh sửa sản phẩm: ${product.name}`);
                }}
              >
                Edit Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout for multiple products
  return (
    <div className="space-y-3 w-full max-w-2xl">
      <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <IconPackage size={12} /> Kết quả tìm kiếm ({products.length})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {products.map((product, index) => {
          const isOutOfStock = product.inventoryStatus === "OUT_OF_STOCK" || product.stock === 0;

          return (
            <div
              key={`${product.id ?? product.slug ?? index}`}
              className="glass-card rounded-lg border border-border/70 overflow-hidden flex flex-col justify-between h-full hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Product Visual Header */}
              <div className="relative h-28 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center border-b border-border/50">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.name ?? "Product image"}
                    className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-indigo-400/50">
                    <IconDeviceDesktop size={26} className="stroke-[1.5]" />
                    <span className="text-[7px] uppercase tracking-wider text-muted-foreground mt-1">NexaTech Hardware</span>
                  </div>
                )}

                {/* Hot badge */}
                {product.featured && (
                  <div className="absolute top-1.5 left-1.5">
                    <Badge className="bg-amber-500/95 text-slate-950 hover:bg-amber-500 text-[8px] font-bold py-px px-1.5 uppercase border-none">
                      Hot
                    </Badge>
                  </div>
                )}

                {/* Out of Stock banner */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center">
                    <Badge variant="destructive" className="bg-rose-600/90 text-white border-none text-[8px] font-bold tracking-wider py-0.5 px-2 uppercase">
                      Hết Hàng
                    </Badge>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground font-semibold">
                      {product.sku ?? "No SKU"}
                    </span>
                    {!isOutOfStock && (
                      <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1 border border-emerald-500/25 rounded">
                        Còn hàng
                      </span>
                    )}
                  </div>

                  <h5 className="text-[12px] font-bold text-foreground leading-snug line-clamp-2">
                    {product.name ?? product.slug ?? "Sản phẩm NexaTech"}
                  </h5>
                </div>

                <div className="space-y-2.5">
                  {/* Pricing */}
                  <div className="flex items-baseline gap-1.5 pt-0.5">
                    {typeof product.price === "number" && (
                      <span className="text-xs font-black text-primary tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                    )}
                    {typeof product.compareAtPrice === "number" && product.compareAtPrice > (product.price ?? 0) && (
                      <span className="text-[9px] text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 pt-1.5 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[9px] h-7 px-1 border-border/70 hover:bg-muted/40"
                      onClick={() => {
                        if (product.slug) {
                          window.open(`http://localhost:3000/product/${product.slug}`, "_blank");
                        }
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 text-[9px] h-7 px-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        toast.success(`Chuyển hướng: ${product.name}`);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
