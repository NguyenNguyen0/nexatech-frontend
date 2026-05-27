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
  const params = cleanParams({
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
  });

  const { data } = await axiosClient.get<ApiResponse<AuditLogPageResult>>(AUDIT_API_BASE, {
    params,
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
//   GET  /api/v1/admin/orders/{id}/timeline
//   GET  /api/v1/admin/orders/{id}/state-at?t=<ISO-8601>
//   GET  /api/v1/admin/payments/{id}/timeline
//   GET  /api/v1/admin/payments/{id}/state-at?t=<ISO-8601>
//   GET  /api/v1/admin/orders/trace/{correlationId}
//   GET  /api/v1/admin/payments/trace/{correlationId}
//
// These services use the { success, message?, data } envelope (different from
// the audit-service above — kept separate intentionally).
// ─────────────────────────────────────────────────────────────────────────────

interface AuditApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const AUDIT_ORDER_BASE = '/api/v1/admin/orders';
const AUDIT_ORDER_TRACE_BASE = '/api/v1/admin/audit/orders';
const AUDIT_PAYMENT_BASE = '/api/v1/admin/payments';
const AUDIT_PAYMENT_TRACE_BASE = '/api/v1/admin/audit/payments';

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

const toAuditLogEntry = (record: AuditLogRecord): AuditLogEntry => {
  const metadata = record.metadata ?? {};
  const correlationId =
    typeof metadata.correlationId === 'string'
      ? metadata.correlationId
      : typeof metadata.traceId === 'string'
        ? metadata.traceId
        : typeof metadata.businessFlowId === 'string'
          ? metadata.businessFlowId
          : typeof metadata.flowId === 'string'
            ? metadata.flowId
            : undefined;

  return {
    id: record.id,
    action: record.action,
    entityType: record.entityType ?? 'Unknown',
    entityId: record.entityId ?? '',
    oldValue: record.oldValue,
    newValue: record.newValue,
    actor: record.actor,
    reason: record.reason ?? record.message,
    sourceService: record.sourceService,
    payload: metadata,
    correlationId,
    createdAt: record.createdAt ?? record.timestamp ?? new Date().toISOString(),
  };
};

const normalizeAuditLogEntry = (entry: AuditLogEntry): AuditLogEntry => {
  const payload = entry.payload ?? {};
  const correlationId =
    entry.correlationId ??
    (typeof payload.correlationId === 'string'
      ? payload.correlationId
      : typeof payload.traceId === 'string'
        ? payload.traceId
        : typeof payload.businessFlowId === 'string'
          ? payload.businessFlowId
          : typeof payload.flowId === 'string'
            ? payload.flowId
            : undefined);

  return {
    ...entry,
    id: String(entry.id),
    entityType: entry.entityType ?? 'Unknown',
    entityId: entry.entityId ?? '',
    payload,
    correlationId,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
};

const uniqueTimeline = (entries: AuditLogEntry[]): AuditLogEntry[] => {
  const seen = new Set<string>();

  return entries
    .map(normalizeAuditLogEntry)
    .filter((entry) => {
      const key =
        entry.id ||
        `${entry.sourceService ?? 'unknown'}:${entry.entityType}:${entry.entityId}:${entry.action}:${entry.createdAt}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

const optionalList = async <T>(task: Promise<T[]>): Promise<T[]> => {
  try {
    return await task;
  } catch {
    return [];
  }
};

const getEntityTimelineFromAuditService = async (entityId: string): Promise<AuditLogEntry[]> => {
  const result = await searchAuditLogs(1, 100, {
    entityId,
    sortBy: 'timestamp',
    sortDir: 'asc',
  });

  return result.content.map(toAuditLogEntry);
};

const readTraceResponse = <T>(payload: AuditApiResponse<T>, fallbackMessage: string): T => {
  if (!payload.success || !payload.data) {
    throw new Error(payload.message ?? fallbackMessage);
  }
  return payload.data;
};

const getFirstAvailable = async <T>(
  urls: string[],
  fallbackMessage: string,
  config?: { params?: Record<string, unknown> },
): Promise<T> => {
  let lastMessage = fallbackMessage;

  for (const url of urls) {
    const { data, status } = await axiosClient.get<AuditApiResponse<T>>(url, {
      params: config?.params,
      validateStatus: (code) => code < 500,
    });

    if (status === 404) {
      lastMessage = data?.message ?? lastMessage;
      continue;
    }

    if (status >= 400) {
      lastMessage = data?.message ?? lastMessage;
      continue;
    }

    return readTraceResponse(data, fallbackMessage);
  }

  throw new Error(lastMessage);
};

/** Full event timeline for a single order (sorted by createdAt ascending). */
export async function getOrderTimeline(orderId: string): Promise<AuditLogEntry[]> {
  const entries = await getFirstAvailable<AuditLogEntry[]>(
    [
      `${AUDIT_ORDER_BASE}/${orderId}/timeline`,
      `${AUDIT_ORDER_TRACE_BASE}/${orderId}/timeline`,
    ],
    'Không tìm thấy lịch sử đơn hàng này',
  );

  return uniqueTimeline(entries);
}

/**
 * Point-in-time query: reconstructed order state at timestamp T.
 * @param t ISO-8601 datetime string e.g. "2025-05-26T10:00:00Z"
 */
export async function getOrderStateAt(
  orderId: string,
  t: string,
): Promise<Record<string, unknown>> {
  return getFirstAvailable<Record<string, unknown>>(
    [
      `${AUDIT_ORDER_BASE}/${orderId}/state-at`,
      `${AUDIT_ORDER_TRACE_BASE}/${orderId}/state-at`,
    ],
    'Không tìm thấy trạng thái đơn hàng tại thời điểm đã chọn',
    { params: { t } },
  );
}

/** Full event timeline for a single payment. */
export async function getPaymentTimeline(paymentId: string): Promise<AuditLogEntry[]> {
  try {
    const entries = await getFirstAvailable<AuditLogEntry[]>(
      [
        `${AUDIT_PAYMENT_BASE}/${paymentId}/timeline`,
        `${AUDIT_PAYMENT_TRACE_BASE}/${paymentId}/timeline`,
      ],
      'Không tìm thấy lịch sử giao dịch này',
    );
    return uniqueTimeline(entries);
  } catch {
    return uniqueTimeline(await getEntityTimelineFromAuditService(paymentId));
  }
}

/**
 * Point-in-time query: reconstructed payment state at timestamp T.
 * @param t ISO-8601 datetime string e.g. "2025-05-26T10:05:00Z"
 */
export async function getPaymentStateAt(
  paymentId: string,
  t: string,
): Promise<Record<string, unknown>> {
  try {
    return await getFirstAvailable<Record<string, unknown>>(
      [
        `${AUDIT_PAYMENT_BASE}/${paymentId}/state-at`,
        `${AUDIT_PAYMENT_TRACE_BASE}/${paymentId}/state-at`,
      ],
      'Không tìm thấy trạng thái giao dịch tại thời điểm đã chọn',
      { params: { t } },
    );
  } catch {
    const entries = await getPaymentTimeline(paymentId);
    const point = new Date(t).getTime();
    return entries
      .filter((entry) => new Date(entry.createdAt).getTime() <= point)
      .reduce<Record<string, unknown>>((state, entry) => ({
        ...state,
        ...(entry.payload ?? {}),
        action: entry.action,
        updatedAt: entry.createdAt,
      }), {});
  }
}

/**
 * Full business flow for a lookup value. The lookup can be a business flow ID,
 * order ID, payment ID, order number, or any value recorded in audit metadata.
 */
export async function traceByCorrelationId(lookupId: string): Promise<AuditLogEntry[]> {
  const value = lookupId.trim();
  if (!value) return [];

  const encodedLookup = encodeURIComponent(value);

  const getAuditServiceTrace = async (lookup: string): Promise<AuditLogEntry[]> => {
    const { data } = await axiosClient.get<ApiResponse<AuditLogRecord[]>>(
      `${AUDIT_API_BASE}/trace/${encodeURIComponent(lookup)}`,
      { validateStatus: (code) => code < 500 },
    );

    if (data.code !== 1000 || !data.result) return [];
    return data.result.map(toAuditLogEntry);
  };

  const getOrderTrace = async (lookup: string): Promise<AuditLogEntry[]> => {
    const entries = await getFirstAvailable<AuditLogEntry[]>(
      [
        `${AUDIT_ORDER_BASE}/trace/${encodeURIComponent(lookup)}`,
        `${AUDIT_ORDER_TRACE_BASE}/trace/${encodeURIComponent(lookup)}`,
      ],
      'No order events found for this business flow',
    );

    return uniqueTimeline(entries);
  };

  const getPaymentTrace = async (lookup: string): Promise<AuditLogEntry[]> => {
    const entries = await getFirstAvailable<AuditLogEntry[]>(
      [
        `${AUDIT_PAYMENT_BASE}/trace/${encodeURIComponent(lookup)}`,
        `${AUDIT_PAYMENT_TRACE_BASE}/trace/${encodeURIComponent(lookup)}`,
      ],
      'No payment events found for this business flow',
    );

    return uniqueTimeline(entries);
  };

  const seedGroups = await Promise.all([
    optionalList(getAuditServiceTrace(value)),
    optionalList(getEntityTimelineFromAuditService(value)),
    optionalList(getOrderTimeline(encodedLookup)),
    optionalList(getPaymentTimeline(encodedLookup)),
    optionalList(getOrderTrace(value)),
    optionalList(getPaymentTrace(value)),
  ]);

  const seedEntries = uniqueTimeline(seedGroups.flat());
  const relatedFlowIds = [
    ...new Set(seedEntries.map((entry) => entry.correlationId).filter((id): id is string => Boolean(id && id !== value))),
  ];

  const relatedGroups = await Promise.all(
    relatedFlowIds.flatMap((flowId) => [
      optionalList(getAuditServiceTrace(flowId)),
      optionalList(getOrderTrace(flowId)),
      optionalList(getPaymentTrace(flowId)),
    ]),
  );

  const traceEntries = uniqueTimeline([...seedEntries, ...relatedGroups.flat()]);

  return traceEntries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
