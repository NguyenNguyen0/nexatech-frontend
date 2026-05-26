import axiosClient from '@/lib/axiosClient';
import type { ApiResponse } from '@/types/auth';

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
    throw new Error(data.message || 'Không thể tải danh sách audit logs');
  }
  return data.result;
};

export const getAuditLogById = async (id: string): Promise<AuditLogRecord> => {
  const { data } = await axiosClient.get<ApiResponse<AuditLogRecord>>(`${AUDIT_API_BASE}/${id}`);
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Không thể tải chi tiết audit log');
  }
  return data.result;
};

export const getAuditFacets = async (): Promise<AuditFacets> => {
  const { data } = await axiosClient.get<ApiResponse<AuditFacets>>(`${AUDIT_API_BASE}/facets`);
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Không thể tải danh sách facets');
  }
  return data.result;
};
