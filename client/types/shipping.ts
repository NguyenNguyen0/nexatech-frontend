/**
 * Types mirroring shipping-service backend DTOs.
 * ApiResponse format: { success: boolean, data: T, message?: string, timestamp: string }
 */

export type ShipmentStatus =
  | 'PENDING_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED';

export type ShippingProvider = 'MOCK' | 'GHN';

/** Wrapper response từ shipping-service (khác với identity/order service). */
export interface ShippingApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface TrackingHistoryResponse {
  status: ShipmentStatus;
  locationAddress?: string;
  lat?: number;
  lng?: number;
  note?: string;
  /** LocalDateTime serialised as ISO-8601 string */
  eventTime: string;
}

export interface CurrentLocation {
  address?: string;
  lat?: number;
  lng?: number;
}

export interface TrackingResponse {
  trackingCode: string;
  provider: ShippingProvider;
  status: ShipmentStatus;
  currentLocation?: CurrentLocation;
  histories: TrackingHistoryResponse[] | null;
}
