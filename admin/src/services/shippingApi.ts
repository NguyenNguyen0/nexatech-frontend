import axiosClient from '@/lib/axiosClient';

// ── types ──────────────────────────────────────────────────────────────────────

export type ShipmentStatus =
  | 'PENDING_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED';

export type ShippingProvider = 'GHN' | 'GHTK' | 'MOCK' | string;

export interface CurrentLocation {
  address?: string;
  lat?: number;
  lng?: number;
}

export interface TrackingHistoryEntry {
  status: ShipmentStatus;
  locationAddress: string;
  lat?: number;
  lng?: number;
  note?: string;
  eventTime: string;
}

export interface TrackingInfo {
  orderId?: string;
  trackingCode: string;
  provider: ShippingProvider;
  status: ShipmentStatus;
  shippingFee?: number;
  currency?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  currentLocation?: CurrentLocation;
  histories: TrackingHistoryEntry[];
}

export interface CancelShipmentResponse {
  trackingCode: string;
  status: ShipmentStatus;
  message?: string;
}

export interface ShipmentPage {
  content: TrackingInfo[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface GetShipmentsParams {
  page?: number;
  size?: number;
  status?: ShipmentStatus;
  sort?: string;
}

// ── api response wrapper ───────────────────────────────────────────────────────

interface ShippingApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ── api calls ──────────────────────────────────────────────────────────────────

export async function getShipmentByOrderId(orderId: string): Promise<TrackingInfo> {
  const res = await axiosClient.get<ShippingApiResponse<TrackingInfo>>(
    `/api/v1/shipping/orders/${orderId}`,
  );
  return res.data.data;
}

export async function getShipments(params?: GetShipmentsParams): Promise<ShipmentPage> {
  const res = await axiosClient.get<ShippingApiResponse<ShipmentPage>>(
    '/api/v1/shipping/shipments',
    { params },
  );
  return res.data.data;
}

export async function getOptionalShipmentByOrderId(
  orderId: string,
  timeoutMs = 2500,
): Promise<TrackingInfo | null> {
  const res = await axiosClient.get<ShippingApiResponse<TrackingInfo>>(
    `/api/v1/shipping/orders/${orderId}`,
    {
      timeout: timeoutMs,
      validateStatus: (status) => status < 500,
    },
  );

  if (res.status === 404) return null;
  if (res.status >= 400 || !res.data?.data) return null;

  return res.data.data;
}

export async function getShipmentTracking(trackingCode: string): Promise<TrackingInfo> {
  const res = await axiosClient.get<ShippingApiResponse<TrackingInfo>>(
    `/api/v1/shipping/shipments/${trackingCode}/tracking`,
  );
  return res.data.data;
}

export async function getOptionalShipmentTracking(
  trackingCode: string,
  timeoutMs = 2500,
): Promise<TrackingInfo | null> {
  const res = await axiosClient.get<ShippingApiResponse<TrackingInfo>>(
    `/api/v1/shipping/shipments/${trackingCode}/tracking`,
    {
      timeout: timeoutMs,
      validateStatus: (status) => status < 500,
    },
  );

  if (res.status === 404) return null;
  if (res.status >= 400 || !res.data?.data) return null;
  return res.data.data;
}

export async function cancelShipment(trackingCode: string): Promise<CancelShipmentResponse> {
  const res = await axiosClient.post<ShippingApiResponse<CancelShipmentResponse>>(
    `/api/v1/shipping/shipments/${trackingCode}/cancel`,
  );
  return res.data.data;
}
