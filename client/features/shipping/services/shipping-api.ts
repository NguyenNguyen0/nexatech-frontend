/**
 * Shipping API service — customer-facing.
 * Base: /api/v1/shipping
 *
 * ⚠️  shipping-service dùng ApiResponse format KHÁC với order-service:
 *       { success: boolean, data: T, message?: string, timestamp: string }
 *     Trường payload là `data`, không phải `result`.
 */

import axiosClient from '@/lib/axios-client';
import type { ShippingApiResponse, TrackingResponse } from '@/types/shipping';
import { SHIPPING_API_BASE } from '@/lib/constants';

/**
 * Lấy thông tin tracking theo orderId.
 * Được gọi trong trang Order Detail để hiển thị hành trình vận chuyển.
 */
export async function getShipmentByOrderId(orderId: string): Promise<TrackingResponse> {
  const { data } = await axiosClient.get<ShippingApiResponse<TrackingResponse>>(
    `${SHIPPING_API_BASE}/orders/${orderId}`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không tìm thấy thông tin vận chuyển');
  return data.data;
}

/**
 * Lấy thông tin tracking theo tracking code (mã vận đơn).
 * Người dùng có thể nhập thủ công để tra cứu.
 */
export async function getTrackingByCode(trackingCode: string): Promise<TrackingResponse> {
  const { data } = await axiosClient.get<ShippingApiResponse<TrackingResponse>>(
    `${SHIPPING_API_BASE}/shipments/${encodeURIComponent(trackingCode)}/tracking`,
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Không tìm thấy thông tin tracking');
  return data.data;
}
