import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Eye,
  Clock,
  User as UserIcon,
  Tag,
  Calendar as CalendarIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PageHeader,
  DataTable,
  Pagination,
  SearchFilter,
  StatusBadge,
  type Column,
} from '@/components/custom';

import {
  getAuditFacets,
  searchAuditLogs,
  type AuditFacets,
  type AuditLogFilters,
  type AuditLogPageResult,
  type AuditLogRecord,
} from '@/services/auditApi';
import {
  actionVariant,
  labelAction,
  labelEntityType,
  labelService,
} from './labels';

const DEFAULT_PAGE_SIZE = 20;

const formatDateTime = (value?: string): string => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return value;
  }
};

const prettyJson = (value?: string | Record<string, unknown> | null): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const toIsoStart = (date: string): string | undefined => {
  if (!date) return undefined;
  return new Date(`${date}T00:00:00`).toISOString();
};

const toIsoEnd = (date: string): string | undefined => {
  if (!date) return undefined;
  return new Date(`${date}T23:59:59.999`).toISOString();
};

export default function AuditLogsPage() {
  const [data, setData] = useState<AuditLogPageResult | null>(null);
  const [facets, setFacets] = useState<AuditFacets>({ actions: [], entityTypes: [], sourceServices: [] });
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedActor, setDebouncedActor] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [sortColumn, setSortColumn] = useState<'timestamp' | 'action' | 'entityType'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Debounce keyword changes so we don't hammer the backend on every keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedActor(searchKeyword.trim());
      setCurrentPage(0);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchKeyword]);

  // Load distinct facets once; they're cheap and let the filter discover
  // new services/actions automatically as the system grows.
  useEffect(() => {
    void (async () => {
      try {
        const result = await getAuditFacets();
        setFacets(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải bộ lọc';
        toast.error(message);
      }
    })();
  }, []);

  const loadLogs = useCallback(async () => {
    const filters: AuditLogFilters = {
      actor: debouncedActor || undefined,
      action: selectedAction || undefined,
      entityType: selectedEntityType || undefined,
      sourceService: selectedSource || undefined,
      from: toIsoStart(fromDate),
      to: toIsoEnd(toDate),
      sortBy: sortColumn,
      sortDir: sortDirection,
    };

    setLoading(true);
    try {
      const result = await searchAuditLogs(currentPage + 1, pageSize, filters);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải audit logs';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedActor,
    selectedAction,
    selectedEntityType,
    selectedSource,
    fromDate,
    toDate,
    sortColumn,
    sortDirection,
  ]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleSort = (column: string) => {
    if (!['timestamp', 'action', 'entityType'].includes(column)) return;
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column as typeof sortColumn);
      setSortDirection('desc');
    }
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSelectedAction('');
    setSelectedEntityType('');
    setSelectedSource('');
    setFromDate('');
    setToDate('');
    setCurrentPage(0);
  };

  const logs = useMemo(() => data?.content ?? [], [data]);
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Build filter options dynamically from facets so the UI auto-grows
  // as new services/actions show up in the system.
  const actionOptions = useMemo(
    () =>
      facets.actions.map((code) => ({
        value: code,
        label: labelAction(code),
      })),
    [facets.actions]
  );
  const entityTypeOptions = useMemo(
    () =>
      facets.entityTypes.map((code) => ({
        value: code,
        label: labelEntityType(code),
      })),
    [facets.entityTypes]
  );
  const sourceOptions = useMemo(
    () =>
      facets.sourceServices.map((code) => ({
        value: code,
        label: labelService(code),
      })),
    [facets.sourceServices]
  );

  const columns: Column<AuditLogRecord>[] = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      cell: (item) => (
        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {formatDateTime(item.timestamp ?? item.createdAt)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'action',
      header: 'Hoạt động',
      cell: (item) => (
        <StatusBadge label={labelAction(item.action)} variant={actionVariant(item.action)} />
      ),
      sortable: true,
    },
    {
      key: 'entityType',
      header: 'Đối tượng',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{labelEntityType(item.entityType)}</span>
          {item.entityLabel && (
            <span className="text-xs text-muted-foreground truncate max-w-[220px]">
              {item.entityLabel}
            </span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actor',
      header: 'Người thực hiện',
      cell: (item) => <ActorCell actor={item.actor} actorId={item.actorId} />,
    },
    {
      key: 'sourceService',
      header: 'Phân hệ',
      cell: (item) => (
        <span className="text-sm">{labelService(item.sourceService)}</span>
      ),
    },
    {
      key: 'message',
      header: 'Mô tả',
      cell: (item) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[380px]">
          {item.message ?? '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (item) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedLog(item);
            setDetailOpen(true);
          }}
          title="Xem chi tiết"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      className: 'w-[50px]',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký hoạt động"
        description="Theo dõi mọi thao tác quan trọng trên hệ thống (đăng nhập, tạo/sửa/xoá dữ liệu...)"
        onRefresh={() => void loadLogs()}
        isLoading={loading}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchFilter
            searchValue={searchKeyword}
            onSearchChange={setSearchKeyword}
            searchPlaceholder="Tìm theo người thực hiện (tên đăng nhập, email...)"
            filters={[
              {
                key: 'sourceService',
                label: 'Phân hệ',
                placeholder: 'Tất cả phân hệ',
                value: selectedSource,
                options: sourceOptions,
                onChange: (value) => {
                  setSelectedSource(value === 'all' ? '' : value);
                  setCurrentPage(0);
                },
              },
              {
                key: 'entityType',
                label: 'Đối tượng',
                placeholder: 'Tất cả đối tượng',
                value: selectedEntityType,
                options: entityTypeOptions,
                onChange: (value) => {
                  setSelectedEntityType(value === 'all' ? '' : value);
                  setCurrentPage(0);
                },
              },
              {
                key: 'action',
                label: 'Hoạt động',
                placeholder: 'Tất cả hoạt động',
                value: selectedAction,
                options: actionOptions,
                onChange: (value) => {
                  setSelectedAction(value === 'all' ? '' : value);
                  setCurrentPage(0);
                },
              },
            ]}
            onClear={handleClearFilters}
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm text-muted-foreground">Từ ngày</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(0);
              }}
              className="w-[180px]"
            />
            <label className="text-sm text-muted-foreground">đến ngày</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(0);
              }}
              className="w-[180px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Danh sách hoạt động ({totalElements})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={logs}
            keyExtractor={(item) => item.id}
            isLoading={loading}
            emptyMessage="Chưa có nhật ký nào khớp với bộ lọc"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalElements={totalElements}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(0);
            }}
          />
        </CardContent>
      </Card>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết hoạt động</SheetTitle>
            <SheetDescription>
              {selectedLog?.id && (
                <span className="font-mono text-xs">{selectedLog.id}</span>
              )}
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="mt-6 space-y-4 px-4 pb-6">
              <DetailRow
                label="Thời gian"
                value={formatDateTime(selectedLog.timestamp ?? selectedLog.createdAt)}
              />
              <DetailRow
                label="Hoạt động"
                value={
                  <StatusBadge
                    label={labelAction(selectedLog.action)}
                    variant={actionVariant(selectedLog.action)}
                  />
                }
              />
              <DetailRow label="Phân hệ" value={labelService(selectedLog.sourceService)} />
              <DetailRow label="Đối tượng" value={labelEntityType(selectedLog.entityType)} />
              <DetailRow
                label="Tên đối tượng"
                value={selectedLog.entityLabel ?? '—'}
              />
              <DetailRow label="Mã đối tượng" value={selectedLog.entityId ?? '—'} mono />
              <DetailRow label="Người thực hiện" value={selectedLog.actor ?? 'system'} />
              <DetailRow label="ID người thực hiện" value={selectedLog.actorId ?? '—'} mono />
              <DetailRow label="Lý do" value={selectedLog.reason ?? '—'} />
              <DetailRow label="Mô tả" value={selectedLog.message ?? '—'} />

              <DetailBlock label="Giá trị trước" value={prettyJson(selectedLog.oldValue)} />
              <DetailBlock label="Giá trị sau" value={prettyJson(selectedLog.newValue)} />
              <DetailBlock label="Metadata" value={prettyJson(selectedLog.metadata)} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface ActorCellProps {
  actor?: string;
  actorId?: string;
}

function ActorCell({ actor, actorId }: ActorCellProps) {
  const display = actor && actor.trim() !== '' ? actor : 'system';
  const showTooltip = !!actorId && actorId !== display;

  const content = (
    <div className="flex items-center gap-2 text-sm">
      <UserIcon className="h-4 w-4 text-muted-foreground" />
      <span className="truncate max-w-[200px]">{display}</span>
    </div>
  );

  if (!showTooltip) return content;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <span className="font-mono text-xs">{actorId}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function DetailRow({ label, value, mono }: DetailRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
        {label}
      </div>
      <div className={mono ? 'col-span-2 font-mono text-xs break-all' : 'col-span-2 text-sm'}>
        {value}
      </div>
    </div>
  );
}

interface DetailBlockProps {
  label: string;
  value: string;
}

function DetailBlock({ label, value }: DetailBlockProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
        {label}
      </div>
      <pre className="bg-muted rounded p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
        {value}
      </pre>
    </div>
  );
}
