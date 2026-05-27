import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Clock,
  CreditCard,
  Database,
  GitBranch,
  PackageCheck,
  RefreshCw,
  Search,
} from 'lucide-react';

import { Button } from '@/components/custom/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

import {
  getOrderStateAt,
  getOrderTimeline,
  getPaymentStateAt,
  getPaymentTimeline,
  traceByCorrelationId,
  type AuditLogEntry,
} from '@/services/auditApi';

type TraceTab = 'order' | 'payment' | 'flow' | 'order-time' | 'payment-time';
type StateKind = 'order' | 'payment';

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'medium' });
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'Chưa có';
  if (typeof value === 'number') return value.toLocaleString('vi-VN');
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  if (typeof value === 'string') {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime()) && value.includes('T')) {
      return formatDateTime(value);
    }
    return value;
  }
  return JSON.stringify(value);
};

const actionLabels: Record<string, string> = {
  ORDER_CREATED: 'Tạo đơn hàng',
  ORDER_STATUS_CHANGED: 'Cập nhật đơn hàng',
  ORDER_CANCELLED: 'Hủy đơn hàng',
  ORDER_CONFIRMED_RECEIVED: 'Đơn hàng đã xác nhận',
  PAYMENT_CREATED: 'Tạo thanh toán',
  PAYMENT_INITIATED: 'Bắt đầu thanh toán',
  PAYMENT_CONFIRMED: 'Thanh toán thành công',
  PAYMENT_CONFIRMED_COD: 'Xác nhận COD',
  PAYMENT_COMPLETED: 'Thanh toán hoàn tất',
  PAYMENT_COMPLETED_RECEIVED: 'Đơn hàng nhận thanh toán',
  PAYMENT_REFUNDED: 'Hoàn tiền',
  PAYMENT_REFUNDED_RECEIVED: 'Đơn hàng nhận hoàn tiền',
  PAYMENT_FAILED: 'Thanh toán thất bại',
  SHIPMENT_CREATED_RECEIVED: 'Đã tạo vận chuyển',
  SHIPMENT_DELIVERED_RECEIVED: 'Giao hàng thành công',
  RETURN_REQUESTED: 'Yêu cầu trả hàng',
  RETURN_APPROVED: 'Duyệt trả hàng',
  RETURN_REJECTED: 'Từ chối trả hàng',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Đang chờ',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả hàng',
  DELIVERED: 'Đã giao',
};

const actionTone = (action: string) => {
  if (action.includes('FAILED') || action.includes('CANCELLED') || action.includes('REJECTED')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (action.includes('REFUND') || action.includes('RETURN')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (action.includes('PAYMENT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (action.includes('SHIPMENT')) return 'bg-sky-50 text-sky-700 border-sky-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

const displayAction = (action: string) => actionLabels[action] ?? action.replaceAll('_', ' ').toLowerCase();

const displayPayloadValue = (value: unknown) => {
  const text = formatValue(value);
  return statusLabels[text] ?? text;
};

const importantKeys = [
  'orderId',
  'paymentId',
  'customerId',
  'orderNumber',
  'amount',
  'totalAmount',
  'refundAmount',
  'method',
  'status',
  'previousStatus',
  'newStatus',
  'transactionId',
  'reason',
  'triggeredBy',
];

const fieldLabels: Record<string, string> = {
  orderId: 'Mã đơn hàng',
  paymentId: 'Mã thanh toán',
  customerId: 'Khách hàng',
  orderNumber: 'Số đơn',
  amount: 'Số tiền',
  totalAmount: 'Tổng tiền',
  refundAmount: 'Số tiền hoàn',
  method: 'Phương thức',
  status: 'Trạng thái',
  previousStatus: 'Trước đó',
  newStatus: 'Sau cập nhật',
  transactionId: 'Mã giao dịch',
  reason: 'Lý do',
  triggeredBy: 'Nguồn cập nhật',
  createdAt: 'Tạo lúc',
  completedAt: 'Hoàn tất lúc',
};

function getPayloadRows(entry: AuditLogEntry) {
  const payload = entry.payload ?? {};
  return importantKeys
    .filter((key) => payload[key] !== undefined && payload[key] !== null && payload[key] !== '')
    .map((key) => ({
      label: fieldLabels[key] ?? key,
      value: displayPayloadValue(payload[key]),
    }));
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-6 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">{message}</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        Nhập mã cần tra cứu rồi bấm tìm kiếm. Nếu chưa có sự kiện, hệ thống sẽ báo rõ thay vì hiển thị lỗi kỹ thuật.
      </p>
    </div>
  );
}

function TimelineView({
  entries,
  loading,
  emptyMessage,
}: {
  entries: AuditLogEntry[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ScrollArea className="mt-4 h-[calc(100vh-390px)] min-h-[320px] pr-3">
      <div className="relative pl-7">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
        {entries.map((entry, index) => {
          const rows = getPayloadRows(entry);
          return (
            <div key={`${entry.id}-${index}`} className="relative mb-5">
              <div className="absolute -left-[26px] mt-2 h-4 w-4 rounded-full border-2 border-primary bg-background" />
              <div className="rounded-md border bg-background p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={actionTone(entry.action)}>
                    {displayAction(entry.action)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
                  {entry.sourceService && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {entry.sourceService.replace('-service', '')}
                    </span>
                  )}
                </div>

                {rows.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {rows.map((row) => (
                      <div key={row.label} className="rounded border bg-muted/25 px-3 py-2">
                        <div className="text-[11px] text-muted-foreground">{row.label}</div>
                        <div className="mt-0.5 break-words text-sm font-medium">{row.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {(entry.reason || entry.oldValue || entry.newValue) && (
                  <div className="mt-3 rounded bg-muted/30 px-3 py-2 text-sm">
                    {entry.reason && <div>{entry.reason}</div>}
                    {entry.oldValue && entry.newValue && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Thay đổi từ {entry.oldValue} sang {entry.newValue}
                      </div>
                    )}
                  </div>
                )}

                {entry.correlationId && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Mã luồng xử lý: <span className="font-mono">{entry.correlationId}</span>
                  </div>
                )}

                {entry.payload && Object.keys(entry.payload).length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer select-none text-xs text-muted-foreground">
                      Xem dữ liệu chi tiết đã ghi nhận
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                      {JSON.stringify(entry.payload, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function SearchBar({
  label,
  placeholder,
  value,
  onChange,
  onSearch,
  loading,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end">
      <div className="min-w-0 flex-1">
        <Label className="mb-1 block text-xs">{label}</Label>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onSearch()}
        />
      </div>
      <Button onClick={onSearch} disabled={loading} className="shrink-0">
        {loading ? <RefreshCw className="mr-1 h-4 w-4 animate-spin" /> : <Search className="mr-1 h-4 w-4" />}
        Tìm kiếm
      </Button>
    </div>
  );
}

function StateSummary({ state }: { state: Record<string, unknown> }) {
  const rows = importantKeys
    .filter((key) => state[key] !== undefined && state[key] !== null && state[key] !== '')
    .map((key) => ({
      label: fieldLabels[key] ?? key,
      value: displayPayloadValue(state[key]),
    }));

  const fallbackRows = Object.entries(state)
    .filter(([key]) => !importantKeys.includes(key))
    .slice(0, 6)
    .map(([key, value]) => ({
      label: fieldLabels[key] ?? key,
      value: displayPayloadValue(value),
    }));

  const visibleRows = rows.length > 0 ? rows : fallbackRows;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visibleRows.map((row) => (
          <div key={row.label} className="rounded-md border bg-background px-3 py-2">
            <div className="text-[11px] text-muted-foreground">{row.label}</div>
            <div className="mt-0.5 break-words text-sm font-medium">{row.value}</div>
          </div>
        ))}
      </div>
      <details>
        <summary className="cursor-pointer select-none text-xs text-muted-foreground">
          Xem dữ liệu chi tiết
        </summary>
        <pre className="mt-2 max-h-80 overflow-auto rounded bg-muted p-3 text-xs">
          {JSON.stringify(state, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function StateAtView({
  kind,
  initialId,
}: {
  kind: StateKind;
  initialId: string;
}) {
  const [id, setId] = useState(initialId);
  const [timestamp, setTimestamp] = useState('');
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setId(initialId), [initialId]);

  const title = kind === 'order' ? 'đơn hàng' : 'thanh toán';

  const query = async () => {
    if (!id.trim() || !timestamp.trim()) {
      toast({ title: 'Thiếu thông tin', description: `Nhập mã ${title} và thời điểm cần xem.`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const iso = new Date(timestamp).toISOString();
      const result = kind === 'order'
        ? await getOrderStateAt(id.trim(), iso)
        : await getPaymentStateAt(id.trim(), iso);
      setState(result);
    } catch (error) {
      toast({ title: 'Không tải được dữ liệu', description: (error as Error).message, variant: 'destructive' });
      setState(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
        Chọn một thời điểm để xem lúc đó {title} đang ở trạng thái nào. Phần này hữu ích khi cần giải thích vì sao
        một đơn đã chuyển từ “đang chờ” sang “đã xác nhận”, hoặc một thanh toán đã chuyển sang “đã hoàn tiền”.
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="min-w-0 flex-1">
          <Label className="mb-1 block text-xs">{kind === 'order' ? 'Mã đơn hàng' : 'Mã thanh toán'}</Label>
          <Input placeholder="Dán mã UUID cần kiểm tra" value={id} onChange={(event) => setId(event.target.value)} />
        </div>
        <div className="min-w-[240px]">
          <Label className="mb-1 block text-xs">Thời điểm cần xem</Label>
          <Input type="datetime-local" value={timestamp} onChange={(event) => setTimestamp(event.target.value)} />
        </div>
        <Button onClick={query} disabled={loading} className="shrink-0">
          {loading ? <RefreshCw className="mr-1 h-4 w-4 animate-spin" /> : <Database className="mr-1 h-4 w-4" />}
          Xem lại
        </Button>
      </div>

      {state && (
        <div className="rounded-md border p-4">
          <div className="mb-3 text-sm font-medium">
            Tình trạng tại {timestamp ? new Date(timestamp).toLocaleString('vi-VN') : 'thời điểm đã chọn'}
          </div>
          <StateSummary state={state} />
        </div>
      )}
    </div>
  );
}

export function AuditTrace() {
  const [searchParams] = useSearchParams();
  const preOrderId = searchParams.get('orderId') ?? '';
  const prePaymentId = searchParams.get('paymentId') ?? '';

  const [activeTab, setActiveTab] = useState<TraceTab>(prePaymentId ? 'payment' : 'order');

  const [orderId, setOrderId] = useState(preOrderId);
  const [orderTimeline, setOrderTimeline] = useState<AuditLogEntry[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);

  const [paymentId, setPaymentId] = useState(prePaymentId);
  const [paymentTimeline, setPaymentTimeline] = useState<AuditLogEntry[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [flowId, setFlowId] = useState('');
  const [flowTimeline, setFlowTimeline] = useState<AuditLogEntry[]>([]);
  const [flowLoading, setFlowLoading] = useState(false);

  const servicesInFlow = useMemo(
    () => [...new Set(flowTimeline.map((entry) => entry.sourceService).filter(Boolean))],
    [flowTimeline],
  );

  const loadOrderTimeline = async (id = orderId) => {
    if (!id.trim()) {
      toast({ title: 'Nhập mã đơn hàng', variant: 'destructive' });
      return;
    }
    setOrderLoading(true);
    try {
      const data = await getOrderTimeline(id.trim());
      setOrderTimeline(data);
    } catch (error) {
      toast({ title: 'Không tải được lịch sử đơn hàng', description: (error as Error).message, variant: 'destructive' });
      setOrderTimeline([]);
    } finally {
      setOrderLoading(false);
    }
  };

  const loadPaymentTimeline = async (id = paymentId) => {
    if (!id.trim()) {
      toast({ title: 'Nhập mã thanh toán', variant: 'destructive' });
      return;
    }
    setPaymentLoading(true);
    try {
      const data = await getPaymentTimeline(id.trim());
      setPaymentTimeline(data);
    } catch (error) {
      toast({ title: 'Không tải được lịch sử thanh toán', description: (error as Error).message, variant: 'destructive' });
      setPaymentTimeline([]);
    } finally {
      setPaymentLoading(false);
    }
  };

  const loadFlow = async () => {
    if (!flowId.trim()) {
      toast({ title: 'Nhập mã luồng xử lý', variant: 'destructive' });
      return;
    }
    setFlowLoading(true);
    try {
      const data = await traceByCorrelationId(flowId.trim());
      setFlowTimeline(data);
    } catch (error) {
      toast({ title: 'Không tải được luồng xử lý', description: (error as Error).message, variant: 'destructive' });
      setFlowTimeline([]);
    } finally {
      setFlowLoading(false);
    }
  };

  useEffect(() => {
    if (preOrderId) void loadOrderTimeline(preOrderId);
    if (prePaymentId) void loadPaymentTimeline(prePaymentId);
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Activity className="h-5 w-5" />
          Tra cứu lịch sử xử lý
        </h2>
        <p className="text-sm text-muted-foreground">
          Xem lại các bước đã xảy ra với đơn hàng, thanh toán và toàn bộ luồng mua hàng.
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chọn nội dung cần kiểm tra</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TraceTab)}>
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 md:grid-cols-5">
              <TabsTrigger value="order">
                <PackageCheck className="mr-1 h-4 w-4" /> Đơn hàng
              </TabsTrigger>
              <TabsTrigger value="payment">
                <CreditCard className="mr-1 h-4 w-4" /> Thanh toán
              </TabsTrigger>
              <TabsTrigger value="flow">
                <GitBranch className="mr-1 h-4 w-4" /> Toàn bộ luồng
              </TabsTrigger>
              <TabsTrigger value="order-time">
                <Clock className="mr-1 h-4 w-4" /> Đơn theo giờ
              </TabsTrigger>
              <TabsTrigger value="payment-time">
                <Database className="mr-1 h-4 w-4" /> Thanh toán theo giờ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="order" className="mt-4 space-y-3">
              <SearchBar
                label="Mã đơn hàng"
                placeholder="Dán mã đơn hàng cần xem"
                value={orderId}
                onChange={setOrderId}
                onSearch={() => void loadOrderTimeline()}
                loading={orderLoading}
              />
              {orderTimeline.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Có {orderTimeline.length} bước được ghi nhận. Bước mới nhất lúc {formatDateTime(orderTimeline.at(-1)!.createdAt)}.
                </p>
              )}
              <TimelineView
                entries={orderTimeline}
                loading={orderLoading}
                emptyMessage="Chưa có lịch sử đơn hàng để hiển thị"
              />
            </TabsContent>

            <TabsContent value="payment" className="mt-4 space-y-3">
              <SearchBar
                label="Mã thanh toán"
                placeholder="Dán mã thanh toán cần xem"
                value={paymentId}
                onChange={setPaymentId}
                onSearch={() => void loadPaymentTimeline()}
                loading={paymentLoading}
              />
              {paymentTimeline.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Có {paymentTimeline.length} bước được ghi nhận. Bước mới nhất lúc {formatDateTime(paymentTimeline.at(-1)!.createdAt)}.
                </p>
              )}
              <TimelineView
                entries={paymentTimeline}
                loading={paymentLoading}
                emptyMessage="Chưa có lịch sử thanh toán để hiển thị"
              />
            </TabsContent>

            <TabsContent value="flow" className="mt-4 space-y-3">
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                Dùng mã luồng xử lý để xem các bước liên quan trên nhiều dịch vụ, ví dụ: tạo đơn, tạo thanh toán,
                xác nhận thanh toán và cập nhật đơn hàng.
              </div>
              <SearchBar
                label="Mã luồng xử lý"
                placeholder="Dán mã luồng từ lịch sử đơn hoặc thanh toán"
                value={flowId}
                onChange={setFlowId}
                onSearch={() => void loadFlow()}
                loading={flowLoading}
              />
              {flowTimeline.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{flowTimeline.length} bước được ghi nhận</span>
                  {servicesInFlow.length > 0 && <span>Đi qua: {servicesInFlow.join(', ')}</span>}
                </div>
              )}
              <TimelineView
                entries={flowTimeline}
                loading={flowLoading}
                emptyMessage="Chưa có luồng xử lý để hiển thị"
              />
            </TabsContent>

            <TabsContent value="order-time">
              <StateAtView kind="order" initialId={orderId} />
            </TabsContent>

            <TabsContent value="payment-time">
              <StateAtView kind="payment" initialId={paymentId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
