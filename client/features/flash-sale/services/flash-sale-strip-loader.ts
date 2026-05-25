// Server-side only — uses process.env for absolute URLs (not client rewrites)

export interface FlashSaleStripItem {
  id: string;
  productId: string;
  productSlug?: string;
  productName: string;
  productImage?: string;
  productRating?: number;
  salePrice: number;
  originalPrice: number;
  discountPercent: number;
  remainingStock: number;
  totalStock: number;
  soldPercent: number;
}

export interface FlashSaleStripData {
  items: FlashSaleStripItem[];
  endsAt: number; // Unix timestamp ms — 0 means no active sale
}

const PROMOTION_URL =
  process.env.PROMOTION_SERVICE_URL?.replace(/\/$/, '') ?? 'http://localhost:8093';

interface RawFlashSale {
  id: string;
  productId: string;
  productName?: string;
  productSlug?: string;
  productThumbnail?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  totalStock: number;
  remainingStock: number;
  soldCount: number;
  soldPercent: number;
  endTime: string;
  status: string;
}

interface FlashSaleApiResponse {
  success: boolean;
  data: {
    items: RawFlashSale[];
    total: number;
  };
}

async function fetchActiveFlashSales(): Promise<RawFlashSale[]> {
  try {
    const res = await fetch(`${PROMOTION_URL}/api/v1/flash-sales`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as FlashSaleApiResponse;
    return body.data?.items ?? [];
  } catch {
    return [];
  }
}

export async function fetchFlashSaleStripData(): Promise<FlashSaleStripData> {
  const flashSales = await fetchActiveFlashSales();

  if (flashSales.length === 0) {
    return { items: [], endsAt: 0 };
  }

  const items: FlashSaleStripItem[] = flashSales.map((fs) => ({
    id: fs.id,
    productId: fs.productId,
    productSlug: fs.productSlug,
    productName: fs.productName ?? 'Sản phẩm Flash Sale',
    productImage: fs.productThumbnail,
    salePrice: fs.salePrice,
    originalPrice: fs.originalPrice,
    discountPercent: fs.discountPercent,
    remainingStock: fs.remainingStock,
    totalStock: fs.totalStock,
    soldPercent: fs.soldPercent,
  }));

  // Use earliest endTime for the strip countdown
  const endsAt = Math.min(
    ...flashSales.map((fs) => new Date(fs.endTime).getTime()),
  );

  return { items, endsAt };
}

/** Find the active flash sale for a given product slug (for PDP price override). */
export async function fetchFlashSaleByProductSlug(
  slug: string,
): Promise<FlashSaleStripItem | null> {
  const flashSales = await fetchActiveFlashSales();
  const match = flashSales.find((fs) => fs.productSlug === slug);
  if (!match) return null;
  return {
    id: match.id,
    productId: match.productId,
    productSlug: match.productSlug,
    productName: match.productName ?? 'Sản phẩm Flash Sale',
    productImage: match.productThumbnail,
    salePrice: match.salePrice,
    originalPrice: match.originalPrice,
    discountPercent: match.discountPercent,
    remainingStock: match.remainingStock,
    totalStock: match.totalStock,
    soldPercent: match.soldPercent,
  };
}

