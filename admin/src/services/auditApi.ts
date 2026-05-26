/**
 * Admin Audit / Trace Log API service.
 *
 * order-service  → /api/v1/admin/audit/orders/**
 *               → /api/v1/admin/audit/trace/**
 * payment-service → /api/v1/admin/audit/payments/**
 *
 * Both services use { success: boolean, message?: string, data: T } format
 */

import axiosClient from '@/lib/axiosClient';

interface AuditApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const AUDIT_ORDER_BASE   = '/api/v1/admin/audit/orders';
const AUDIT_PAYMENT_BASE = '/api/v1/admin/audit/payments';
const AUDIT_TRACE_BASE   = '/api/v1/admin/audit/trace';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  actor?: string;
  reason?: string;
  sourceService?: string;
  payload?: Record<string, unknown>;
  correlationId?: string;
  createdAt: string;
}

// ── Order Audit ───────────────────────────────────────────────────────────────

/** Full event timeline for a single order (sorted by createdAt ascending). */
export async function getOrderTimeline(orderId: string): Promise<AuditLogEntry[]> {
  const { data } = await axiosClient.get<AuditApiResponse<AuditLogEntry[]>>(
    `${AUDIT_ORDER_BASE}/${orderId}/timeline`,
  );
  if (!data.data) throw new Error(data.message ?? 'Không tải được lịch sử đơn hàng');
  return data.data;
}

/**
 * Point-in-time query: reconstructed order state at timestamp T.
 * @param t ISO-8601 datetime string e.g. "2025-05-26T10:00:00Z"
 */
export async function getOrderStateAt(
  orderId: string,
  t: string,
): Promise<Record<string, unknown>> {
  const { data } = await axiosClient.get<AuditApiResponse<Record<string, unknown>>>(
    `${AUDIT_ORDER_BASE}/${orderId}/state-at`,
    { params: { t } },
  );
  if (!data.data) throw new Error(data.message ?? 'Không tải được state đơn hàng');
  return data.data;
}

// ── Payment Audit ─────────────────────────────────────────────────────────────

/** Full event timeline for a single payment. */
export async function getPaymentTimeline(paymentId: string): Promise<AuditLogEntry[]> {
  const { data } = await axiosClient.get<AuditApiResponse<AuditLogEntry[]>>(
    `${AUDIT_PAYMENT_BASE}/${paymentId}/timeline`,
  );
  if (!data.data) throw new Error(data.message ?? 'Không tải được lịch sử giao dịch');
  return data.data;
}

/**
 * Point-in-time query: reconstructed payment state at timestamp T.
 * @param t ISO-8601 datetime string e.g. "2025-05-26T10:05:00Z"
 */
export async function getPaymentStateAt(
  paymentId: string,
  t: string,
): Promise<Record<string, unknown>> {
  const { data } = await axiosClient.get<AuditApiResponse<Record<string, unknown>>>(
    `${AUDIT_PAYMENT_BASE}/${paymentId}/state-at`,
    { params: { t } },
  );
  if (!data.data) throw new Error(data.message ?? 'Không tải được state giao dịch');
  return data.data;
}

// ── Cross-service trace ───────────────────────────────────────────────────────

/**
 * All audit events sharing the same OpenTelemetry correlationId (traceId).
 * Shows the full business flow: ORDER_CREATED → PAYMENT_INITIATED → PAYMENT_COMPLETED, etc.
 */
export async function traceByCorrelationId(correlationId: string): Promise<AuditLogEntry[]> {
  const { data } = await axiosClient.get<AuditApiResponse<AuditLogEntry[]>>(
    `${AUDIT_TRACE_BASE}/${correlationId}`,
  );
  if (!data.data) throw new Error(data.message ?? 'Không tải được trace log');
  return data.data;
}
