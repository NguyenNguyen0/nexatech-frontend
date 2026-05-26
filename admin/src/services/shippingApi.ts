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
  trackingCode: string;
  provider: ShippingProvider;
  status: ShipmentStatus;
  currentLocation?: CurrentLocation;
  histories: TrackingHistoryEntry[];
}

export interface CancelShipmentResponse {
  trackingCode: string;
  status: ShipmentStatus;
  message?: string;
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

export async function getShipmentTracking(trackingCode: string): Promise<TrackingInfo> {
  const res = await axiosClient.get<ShippingApiResponse<TrackingInfo>>(
    `/api/v1/shipping/shipments/${trackingCode}/tracking`,
  );
  return res.data.data;
}

export async function cancelShipment(trackingCode: string): Promise<CancelShipmentResponse> {
  const res = await axiosClient.post<ShippingApiResponse<CancelShipmentResponse>>(
    `/api/v1/shipping/shipments/${trackingCode}/cancel`,
  );
  return res.data.data;
}
