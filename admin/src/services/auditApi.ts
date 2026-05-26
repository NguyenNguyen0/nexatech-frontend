import axiosClient from '@/lib/axiosClient';
import type { ApiResponse } from '@/types/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Audit Log — audit-service (Kafka consumer + Mongo store)
//
//   GET  /api/v1/admin/audit          (paged search + filters)
//   GET  /api/v1/admin/audit/{id}     (single record)
//   GET  /api/v1/admin/audit/facets   (distinct actions/entities/services)
//
// All endpoints return ApiResponse<T> with code=1000 on success.
// ─────────────────────────────────────────────────────────────────────────────

const AUDIT_API_BASE = '/api/v1/admin/audit';

export interface AuditLogRecord {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  oldValue?: string;
  newValue?: string;
  actor?: string;
  actorId?: string;
  reason?: string;
  sourceService?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
  createdAt?: string;
}

export interface AuditFacets {
  actions: string[];
  entityTypes: string[];
  sourceServices: string[];
}

export interface AuditLogPageResult {
  content: AuditLogRecord[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  entityId?: string;
  actor?: string;
  sourceService?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const cleanParams = (params: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    result[key] = value;
  }
  return result;
};

export const searchAuditLogs = async (
  page = 1,
  size = 20,
  filters: AuditLogFilters = {}
): Promise<AuditLogPageResult> => {
  const { data } = await axiosClient.get<ApiResponse<AuditLogPageResult>>(AUDIT_API_BASE, {
    params: cleanParams({
      page,
      size,
      action: filters.action,
      entityType: filters.entityType,
      entityId: filters.entityId,
      actor: filters.actor,
      sourceService: filters.sourceService,
      from: filters.from,
      to: filters.to,
      sortBy: filters.sortBy ?? 'timestamp',
      sortDir: filters.sortDir ?? 'desc',
    }),
  });

  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Failed to load audit logs');
  }
  return data.result;
};

export const getAuditLogById = async (id: string): Promise<AuditLogRecord> => {
  const { data } = await axiosClient.get<ApiResponse<AuditLogRecord>>(`${AUDIT_API_BASE}/${id}`);
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Failed to load audit log details');
  }
  return data.result;
};

export const getAuditFacets = async (): Promise<AuditFacets> => {
  const { data } = await axiosClient.get<ApiResponse<AuditFacets>>(`${AUDIT_API_BASE}/facets`);
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Failed to load filter facets');
  }
  return data.result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Order / Payment trace logs — order-service + payment-service
//
//   GET  /api/v1/admin/audit/orders/{id}/timeline
//   GET  /api/v1/admin/audit/orders/{id}/state-at?t=<ISO-8601>
//   GET  /api/v1/admin/audit/payments/{id}/timeline
//   GET  /api/v1/admin/audit/payments/{id}/state-at?t=<ISO-8601>
//   GET  /api/v1/admin/audit/trace/{correlationId}
//
// These services use the { success, message?, data } envelope (different from
// the audit-service above — kept separate intentionally).
// ─────────────────────────────────────────────────────────────────────────────

interface AuditApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const AUDIT_ORDER_BASE = '/api/v1/admin/audit/orders';
const AUDIT_PAYMENT_BASE = '/api/v1/admin/audit/payments';
const AUDIT_TRACE_BASE = '/api/v1/admin/audit/trace';

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
