/**
 * AuditTrace — admin page for event sourcing / audit log exploration.
 *
 * Tab 1: Order Timeline   — full history of 1 order  (GET /api/v1/admin/audit/orders/{id}/timeline)
 * Tab 2: Payment Timeline — full history of 1 payment (GET /api/v1/admin/audit/payments/{id}/timeline)
 * Tab 3: Trace            — cross-service events by correlationId (GET /api/v1/admin/audit/trace/{cid})
 * Tab 4: State-at-time    — point-in-time reconstruction (GET …/state-at?t=ISO)
 *
 * Pre-populates orderId/paymentId from query params (?orderId=... or ?paymentId=...).
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, Clock, Activity, GitBranch, Database } from 'lucide-react';

import { Button } from '@/components/custom/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  getOrderTimeline,
  getPaymentTimeline,
  getOrderStateAt,
  getPaymentStateAt,
  traceByCorrelationId,
  type AuditLogEntry,
} from '@/services/auditApi';

// ── helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'medium' });

const ACTION_COLORS: Record<string, string> = {
  ORDER_CREATED:          'bg-green-100 text-green-800',
  ORDER_STATUS_CHANGED:   'bg-blue-100 text-blue-800',
  ORDER_CANCELLED:        'bg-red-100 text-red-800',
  ORDER_SHIPPED:          'bg-cyan-100 text-cyan-800',
  ORDER_DELIVERED:        'bg-emerald-100 text-emerald-800',
  PAYMENT_CREATED:        'bg-purple-100 text-purple-800',
  PAYMENT_COMPLETED:      'bg-emerald-100 text-emerald-800',
  PAYMENT_FAILED:         'bg-red-100 text-red-800',
  PAYMENT_REFUNDED:       'bg-orange-100 text-orange-800',
  PAYMENT_COMPLETED_RECV: 'bg-blue-100 text-blue-800',
};

const actionColor = (action: string) =>
  ACTION_COLORS[action] ?? 'bg-gray-100 text-gray-700';

// ── TimelineView ──────────────────────────────────────────────────────────────

function TimelineView({ entries, loading }: { entries: AuditLogEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-10">
        Chưa có dữ liệu. Nhập ID và nhấn Tìm kiếm.
      </p>
    );
  }

  return (
    <ScrollArea className="mt-4 h-[calc(100vh-360px)]">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />

        {entries.map((entry, idx) => (
          <div key={entry.id} className="relative mb-6">
            {/* Dot */}
            <div className="absolute -left-4 mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />

            <div className="rounded-lg border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge className={actionColor(entry.action)}>{entry.action}</Badge>
                <span className="text-xs text-muted-foreground">{fmtDate(entry.createdAt)}</span>
                {entry.sourceService && (
                  <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                    {entry.sourceService}
                  </span>
                )}
                {entry.actor && (
                  <span className="text-xs text-muted-foreground">by {entry.actor}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {entry.reason && (
                  <div>
                    <span className="text-muted-foreground">Lý do: </span>
                    {entry.reason}
                  </div>
                )}
                {entry.correlationId && (
                  <div className="col-span-full">
                    <span className="text-muted-foreground text-xs">correlationId: </span>
                    <span className="font-mono text-xs">{entry.correlationId}</span>
                  </div>
                )}
              </div>

              {/* old→new */}
              {(entry.oldValue || entry.newValue) && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
                  {entry.oldValue && (
                    <div className="bg-red-50 rounded p-2 text-red-700 overflow-auto max-h-24">
                      <span className="block text-muted-foreground mb-1">Trước:</span>
                      {entry.oldValue}
                    </div>
                  )}
                  {entry.newValue && (
                    <div className="bg-green-50 rounded p-2 text-green-700 overflow-auto max-h-24">
                      <span className="block text-muted-foreground mb-1">Sau:</span>
                      {entry.newValue}
                    </div>
                  )}
                </div>
              )}

              {/* payload */}
              {entry.payload && Object.keys(entry.payload).length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer select-none">
                    Payload ({Object.keys(entry.payload).length} trường)
                  </summary>
                  <pre className="mt-1 text-xs bg-muted rounded p-2 overflow-auto max-h-48">
                    {JSON.stringify(entry.payload, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ── StateAtView ───────────────────────────────────────────────────────────────

function StateAtView({
  entityType,
  entityId,
}: {
  entityType: 'order' | 'payment';
  entityId: string;
}) {
  const [id, setId] = useState(entityId);
  const [timestamp, setTimestamp] = useState('');
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const query = async () => {
    if (!id.trim() || !timestamp.trim()) {
      toast({ title: 'Cần nhập ID và thời điểm', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const result =
        entityType === 'order'
          ? await getOrderStateAt(id, new Date(timestamp).toISOString())
          : await getPaymentStateAt(id, new Date(timestamp).toISOString());
      setState(result);
    } catch (e: unknown) {
      toast({ title: 'Lỗi', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-2 flex-wrap items-end">
        <div className="flex-1 min-w-50">
          <Label className="text-xs mb-1 block">
            {entityType === 'order' ? 'Order ID' : 'Payment ID'}
          </Label>
          <Input
            placeholder="UUID..."
            value={id}
            onChange={e => setId(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-50">
          <Label className="text-xs mb-1 block">Thời điểm</Label>
          <Input
            type="datetime-local"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
          />
        </div>
        <Button onClick={query} disabled={loading}>
          <Database size={14} className="mr-1" />
          {loading ? 'Đang tải...' : 'Xem state'}
        </Button>
      </div>

      {state && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">
              State tại {timestamp ? new Date(timestamp).toLocaleString('vi-VN') : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-96">
              {JSON.stringify(state, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────

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
  onChange: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Label className="text-xs mb-1 block">{label}</Label>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
        />
      </div>
      <Button onClick={onSearch} disabled={loading}>
        {loading
          ? <RefreshCw size={14} className="animate-spin mr-1" />
          : <Search size={14} className="mr-1" />
        }
        Tìm kiếm
      </Button>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function AuditTrace() {
  const [searchParams] = useSearchParams();
  const preOrderId   = searchParams.get('orderId')   ?? '';
  const prePaymentId = searchParams.get('paymentId') ?? '';

  // Tab 1 — Order Timeline
  const [orderId, setOrderId] = useState(preOrderId);
  const [orderTimeline, setOrderTimeline] = useState<AuditLogEntry[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);

  // Tab 2 — Payment Timeline
  const [paymentId, setPaymentId] = useState(prePaymentId);
  const [paymentTimeline, setPaymentTimeline] = useState<AuditLogEntry[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Tab 3 — Trace by correlationId
  const [correlationId, setCorrelationId] = useState('');
  const [traceEntries, setTraceEntries] = useState<AuditLogEntry[]>([]);
  const [traceLoading, setTraceLoading] = useState(false);

  // Active tab
  const defaultTab = prePaymentId ? 'payment' : 'order';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Auto-load if pre-populated from query params
  useEffect(() => {
    if (preOrderId) loadOrderTimeline(preOrderId);
    if (prePaymentId) loadPaymentTimeline(prePaymentId);
  }, []);

  const loadOrderTimeline = async (id: string) => {
    if (!id.trim()) { toast({ title: 'Nhập Order ID', variant: 'destructive' }); return; }
    setOrderLoading(true);
    try {
      const data = await getOrderTimeline(id.trim());
      setOrderTimeline(data);
    } catch (e: unknown) {
      toast({ title: 'Lỗi tải timeline (order)', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setOrderLoading(false);
    }
  };

  const loadPaymentTimeline = async (id: string) => {
    if (!id.trim()) { toast({ title: 'Nhập Payment ID', variant: 'destructive' }); return; }
    setPaymentLoading(true);
    try {
      const data = await getPaymentTimeline(id.trim());
      setPaymentTimeline(data);
    } catch (e: unknown) {
      toast({ title: 'Lỗi tải timeline (payment)', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const loadTrace = async () => {
    if (!correlationId.trim()) { toast({ title: 'Nhập Correlation ID', variant: 'destructive' }); return; }
    setTraceLoading(true);
    try {
      const data = await traceByCorrelationId(correlationId.trim());
      setTraceEntries(data);
    } catch (e: unknown) {
      toast({ title: 'Lỗi tải trace', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setTraceLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity size={20} />
          Audit Trace Log
        </h2>
        <p className="text-sm text-muted-foreground">
          Lịch sử sự kiện, kiểm tra lỗi và point-in-time query cho order / payment
        </p>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="order">
            <Clock size={14} className="mr-1" /> Order Timeline
          </TabsTrigger>
          <TabsTrigger value="payment">
            <Clock size={14} className="mr-1" /> Payment Timeline
          </TabsTrigger>
          <TabsTrigger value="trace">
            <GitBranch size={14} className="mr-1" /> Cross-service Trace
          </TabsTrigger>
          <TabsTrigger value="state-order">
            <Database size={14} className="mr-1" /> State-at (Order)
          </TabsTrigger>
          <TabsTrigger value="state-payment">
            <Database size={14} className="mr-1" /> State-at (Payment)
          </TabsTrigger>
        </TabsList>

        {/* ── Order Timeline ── */}
        <TabsContent value="order" className="mt-4 space-y-3">
          <SearchBar
            label="Order ID (UUID)"
            placeholder="3f2a1b...-...-...-...-..."
            value={orderId}
            onChange={setOrderId}
            onSearch={() => loadOrderTimeline(orderId)}
            loading={orderLoading}
          />
          {orderTimeline.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {orderTimeline.length} sự kiện — cuối cùng: {fmtDate(orderTimeline[orderTimeline.length - 1].createdAt)}
            </p>
          )}
          <TimelineView entries={orderTimeline} loading={orderLoading} />
        </TabsContent>

        {/* ── Payment Timeline ── */}
        <TabsContent value="payment" className="mt-4 space-y-3">
          <SearchBar
            label="Payment ID (UUID)"
            placeholder="abc123...-...-...-...-..."
            value={paymentId}
            onChange={setPaymentId}
            onSearch={() => loadPaymentTimeline(paymentId)}
            loading={paymentLoading}
          />
          {paymentTimeline.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {paymentTimeline.length} sự kiện
            </p>
          )}
          <TimelineView entries={paymentTimeline} loading={paymentLoading} />
        </TabsContent>

        {/* ── Cross-service Trace ── */}
        <TabsContent value="trace" className="mt-4 space-y-3">
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <strong>Cross-service trace</strong>: nhập <code>correlationId</code> (OpenTelemetry traceId)
            để xem toàn bộ sự kiện trong 1 luồng nghiệp vụ xuyên service.
            <br />
            Ví dụ: ORDER_CREATED → PAYMENT_INITIATED → PAYMENT_COMPLETED (cùng 1 correlationId)
          </div>
          <SearchBar
            label="Correlation ID (traceId)"
            placeholder="4bf92f3577b34da6..."
            value={correlationId}
            onChange={setCorrelationId}
            onSearch={loadTrace}
            loading={traceLoading}
          />
          {traceEntries.length > 0 && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{traceEntries.length} sự kiện</span>
              <span>
                Services: {[...new Set(traceEntries.map(e => e.sourceService).filter(Boolean))].join(', ')}
              </span>
            </div>
          )}
          <TimelineView entries={traceEntries} loading={traceLoading} />
        </TabsContent>

        {/* ── State-at (Order) ── */}
        <TabsContent value="state-order">
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 mt-4">
            <strong>Point-in-time query</strong>: xem trạng thái đơn hàng tại một thời điểm cụ thể.
            Hệ thống sẽ lấy snapshot gần nhất trước T, rồi apply lại các audit log từ snapshot đến T.
          </div>
          <StateAtView entityType="order" entityId={orderId} />
        </TabsContent>

        {/* ── State-at (Payment) ── */}
        <TabsContent value="state-payment">
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 mt-4">
            <strong>Point-in-time query</strong>: xem trạng thái giao dịch tại một thời điểm cụ thể.
          </div>
          <StateAtView entityType="payment" entityId={paymentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
