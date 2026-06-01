import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Activity, AlertCircle, Clock, CreditCard, Database, GitBranch, PackageCheck, RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  getOrderStateAt,
  getOrderTimeline,
  getPaymentStateAt,
  getPaymentTimeline,
  traceByCorrelationId,
  type AuditLogEntry,
} from '@/services/auditApi'

type TraceTab = 'order' | 'payment' | 'flow' | 'order-time' | 'payment-time'
type StateKind = 'order' | 'payment'

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
]

const actionLabels: Record<string, string> = {
  ORDER_CREATED: 'Order created',
  ORDER_STATUS_CHANGED: 'Order status updated',
  ORDER_CANCELLED: 'Order cancelled',
  ORDER_CONFIRMED_RECEIVED: 'Customer receipt confirmed',
  PAYMENT_CREATED: 'Payment created',
  PAYMENT_INITIATED: 'Payment started',
  PAYMENT_CONFIRMED: 'Payment confirmed',
  PAYMENT_CONFIRMED_COD: 'COD payment confirmed',
  PAYMENT_COMPLETED: 'Payment completed',
  PAYMENT_COMPLETED_RECEIVED: 'Order received payment',
  PAYMENT_REFUNDED: 'Payment refunded',
  PAYMENT_REFUNDED_RECEIVED: 'Order received refund',
  PAYMENT_FAILED: 'Payment failed',
  SHIPMENT_CREATED_RECEIVED: 'Shipment created',
  SHIPMENT_DELIVERED_RECEIVED: 'Shipment delivered',
  RETURN_REQUESTED: 'Return requested',
  RETURN_APPROVED: 'Return approved',
  RETURN_REJECTED: 'Return rejected',
}

const fieldLabels: Record<string, string> = {
  orderId: 'Order ID',
  paymentId: 'Payment ID',
  customerId: 'Customer',
  orderNumber: 'Order number',
  amount: 'Amount',
  totalAmount: 'Total',
  refundAmount: 'Refund amount',
  method: 'Method',
  status: 'Status',
  previousStatus: 'Previous status',
  newStatus: 'New status',
  transactionId: 'Transaction ID',
  reason: 'Reason',
  triggeredBy: 'Updated by',
  createdAt: 'Created at',
  completedAt: 'Completed at',
}

const formatDateTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'Not recorded'
  if (typeof value === 'number') return value.toLocaleString('en-US')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string') {
    const parsedDate = new Date(value)
    if (!Number.isNaN(parsedDate.getTime()) && value.includes('T')) return formatDateTime(value)
    return value.replaceAll('_', ' ')
  }
  return JSON.stringify(value)
}

const displayAction = (action: string) => actionLabels[action] ?? action.replaceAll('_', ' ').toLowerCase()

const actionTone = (action: string) => {
  if (action.includes('FAILED') || action.includes('CANCELLED') || action.includes('REJECTED')) return 'bg-red-50 text-red-700 border-red-200'
  if (action.includes('REFUND') || action.includes('RETURN')) return 'bg-amber-50 text-amber-700 border-amber-200'
  if (action.includes('PAYMENT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (action.includes('SHIPMENT')) return 'bg-sky-50 text-sky-700 border-sky-200'
  return 'bg-blue-50 text-blue-700 border-blue-200'
}

function getPayloadRows(entry: AuditLogEntry) {
  const payload = entry.payload ?? {}
  return importantKeys
    .filter((key) => payload[key] !== undefined && payload[key] !== null && payload[key] !== '')
    .map((key) => ({ label: fieldLabels[key] ?? key, value: formatValue(payload[key]) }))
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-6 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">{message}</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        Enter an ID and search. If no event has been recorded yet, this page shows a clear empty state instead of a technical error.
      </p>
    </div>
  )
}

function TimelineView({ entries, loading, emptyMessage }: { entries: AuditLogEntry[]; loading: boolean; emptyMessage: string }) {
  if (loading) {
    return (
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}
      </div>
    )
  }

  if (entries.length === 0) return <EmptyState message={emptyMessage} />

  return (
    <ScrollArea className="mt-4 h-[calc(100vh-390px)] min-h-[320px] pr-3">
      <div className="relative pl-7">
        <div className="absolute bottom-0 left-2 top-0 w-px bg-border" />
        {entries.map((entry, index) => {
          const rows = getPayloadRows(entry)
          return (
            <div key={`${entry.id}-${index}`} className="relative mb-5">
              <div className="absolute -left-[26px] mt-2 h-4 w-4 rounded-full border-2 border-primary bg-background" />
              <div className="rounded-md border bg-background p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={actionTone(entry.action)}>{displayAction(entry.action)}</Badge>
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
                        Changed from {entry.oldValue} to {entry.newValue}
                      </div>
                    )}
                  </div>
                )}

                {entry.correlationId && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Business flow ID: <span className="font-mono">{entry.correlationId}</span>
                  </div>
                )}

                {entry.payload && Object.keys(entry.payload).length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer select-none text-xs text-muted-foreground">View recorded details</summary>
                    <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(entry.payload, null, 2)}</pre>
                  </details>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function SearchBar({
  label,
  placeholder,
  value,
  onChange,
  onSearch,
  loading,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  loading: boolean
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end">
      <div className="min-w-0 flex-1">
        <Label className="mb-1 block text-xs">{label}</Label>
        <Input placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onSearch()} />
      </div>
      <Button onClick={onSearch} disabled={loading} className="shrink-0">
        {loading ? <RefreshCw className="mr-1 h-4 w-4 animate-spin" /> : <Search className="mr-1 h-4 w-4" />}
        Search
      </Button>
    </div>
  )
}

function StateSummary({ state }: { state: Record<string, unknown> }) {
  const rows = importantKeys
    .filter((key) => state[key] !== undefined && state[key] !== null && state[key] !== '')
    .map((key) => ({ label: fieldLabels[key] ?? key, value: formatValue(state[key]) }))

  const visibleRows = rows.length > 0
    ? rows
    : Object.entries(state).slice(0, 6).map(([key, value]) => ({ label: fieldLabels[key] ?? key, value: formatValue(value) }))

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
        <summary className="cursor-pointer select-none text-xs text-muted-foreground">View full recorded state</summary>
        <pre className="mt-2 max-h-80 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(state, null, 2)}</pre>
      </details>
    </div>
  )
}

function StateAtView({ kind, initialId }: { kind: StateKind; initialId: string }) {
  const [id, setId] = useState(initialId)
  const [timestamp, setTimestamp] = useState('')
  const [state, setState] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const title = kind === 'order' ? 'order' : 'payment'

  useEffect(() => setId(initialId), [initialId])

  const query = async () => {
    if (!id.trim() || !timestamp.trim()) {
      toast.error('Missing information', {
        description: `Enter a ${title} ID and the time you want to inspect.`,
      })
      return
    }

    setLoading(true)
    try {
      const iso = new Date(timestamp).toISOString()
      const result = kind === 'order' ? await getOrderStateAt(id.trim(), iso) : await getPaymentStateAt(id.trim(), iso)
      setState(result)
    } catch (error) {
      toast.error('Unable to load the recorded state', {
        description: (error as Error).message,
      })
      setState(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
        Choose a time to see what the {title} looked like then. This helps explain changes such as pending to confirmed, paid to refunded, or cancelled.
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="min-w-0 flex-1">
          <Label className="mb-1 block text-xs">{kind === 'order' ? 'Order ID' : 'Payment ID'}</Label>
          <Input placeholder="Paste the UUID to inspect" value={id} onChange={(event) => setId(event.target.value)} />
        </div>
        <div className="min-w-[240px]">
          <Label className="mb-1 block text-xs">Time to inspect</Label>
          <Input type="datetime-local" value={timestamp} onChange={(event) => setTimestamp(event.target.value)} />
        </div>
        <Button onClick={query} disabled={loading} className="shrink-0">
          {loading ? <RefreshCw className="mr-1 h-4 w-4 animate-spin" /> : <Database className="mr-1 h-4 w-4" />}
          Inspect
        </Button>
      </div>
      {state && (
        <div className="rounded-md border p-4">
          <div className="mb-3 text-sm font-medium">
            Recorded state at {timestamp ? new Date(timestamp).toLocaleString('en-US') : 'the selected time'}
          </div>
          <StateSummary state={state} />
        </div>
      )}
    </div>
  )
}

export function AuditTrace() {
  const [searchParams] = useSearchParams()
  const preOrderId = searchParams.get('orderId') ?? ''
  const prePaymentId = searchParams.get('paymentId') ?? ''
  const [activeTab, setActiveTab] = useState<TraceTab>(prePaymentId ? 'payment' : 'order')
  const [orderId, setOrderId] = useState(preOrderId)
  const [orderTimeline, setOrderTimeline] = useState<AuditLogEntry[]>([])
  const [orderLoading, setOrderLoading] = useState(false)
  const [paymentId, setPaymentId] = useState(prePaymentId)
  const [paymentTimeline, setPaymentTimeline] = useState<AuditLogEntry[]>([])
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [flowId, setFlowId] = useState('')
  const [flowTimeline, setFlowTimeline] = useState<AuditLogEntry[]>([])
  const [flowLoading, setFlowLoading] = useState(false)

  const servicesInFlow = useMemo(() => [...new Set(flowTimeline.map((entry) => entry.sourceService).filter(Boolean))], [flowTimeline])

  const loadOrderTimeline = async (id = orderId) => {
    if (!id.trim()) {
      toast.error('Enter an order ID')
      return
    }
    setOrderLoading(true)
    try {
      setOrderTimeline(await getOrderTimeline(id.trim()))
    } catch (error) {
      toast.error('Unable to load order history', {
        description: (error as Error).message,
      })
      setOrderTimeline([])
    } finally {
      setOrderLoading(false)
    }
  }

  const loadPaymentTimeline = async (id = paymentId) => {
    if (!id.trim()) {
      toast.error('Enter a payment ID')
      return
    }
    setPaymentLoading(true)
    try {
      setPaymentTimeline(await getPaymentTimeline(id.trim()))
    } catch (error) {
      toast.error('Unable to load payment history', {
        description: (error as Error).message,
      })
      setPaymentTimeline([])
    } finally {
      setPaymentLoading(false)
    }
  }

  const loadFlow = async () => {
    if (!flowId.trim()) {
      toast.error('Enter a business flow ID')
      return
    }
    setFlowLoading(true)
    try {
      setFlowTimeline(await traceByCorrelationId(flowId.trim()))
    } catch (error) {
      toast.error('Unable to load the business flow', {
        description: (error as Error).message,
      })
      setFlowTimeline([])
    } finally {
      setFlowLoading(false)
    }
  }

  useEffect(() => {
    if (preOrderId) void loadOrderTimeline(preOrderId)
    if (prePaymentId) void loadPaymentTimeline(prePaymentId)
  }, [])

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Activity className="h-5 w-5" />
          Trace Log
        </h2>
        <p className="text-sm text-muted-foreground">Follow what happened to an order, a payment, or a full checkout flow across services.</p>
      </div>
      <Separator />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Choose what to inspect</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TraceTab)}>
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 md:grid-cols-5">
              <TabsTrigger value="order"><PackageCheck className="mr-1 h-4 w-4" /> Order</TabsTrigger>
              <TabsTrigger value="payment"><CreditCard className="mr-1 h-4 w-4" /> Payment</TabsTrigger>
              <TabsTrigger value="flow"><GitBranch className="mr-1 h-4 w-4" /> Full flow</TabsTrigger>
              <TabsTrigger value="order-time"><Clock className="mr-1 h-4 w-4" /> Order at time</TabsTrigger>
              <TabsTrigger value="payment-time"><Database className="mr-1 h-4 w-4" /> Payment at time</TabsTrigger>
            </TabsList>

            <TabsContent value="order" className="mt-4 space-y-3">
              <SearchBar label="Order ID" placeholder="Paste the order ID" value={orderId} onChange={setOrderId} onSearch={() => void loadOrderTimeline()} loading={orderLoading} />
              {orderTimeline.length > 0 && <p className="text-xs text-muted-foreground">{orderTimeline.length} recorded events. Latest event at {formatDateTime(orderTimeline.at(-1)!.createdAt)}.</p>}
              <TimelineView entries={orderTimeline} loading={orderLoading} emptyMessage="No order events to show yet" />
            </TabsContent>

            <TabsContent value="payment" className="mt-4 space-y-3">
              <SearchBar label="Payment ID" placeholder="Paste the payment ID" value={paymentId} onChange={setPaymentId} onSearch={() => void loadPaymentTimeline()} loading={paymentLoading} />
              {paymentTimeline.length > 0 && <p className="text-xs text-muted-foreground">{paymentTimeline.length} recorded events. Latest event at {formatDateTime(paymentTimeline.at(-1)!.createdAt)}.</p>}
              <TimelineView entries={paymentTimeline} loading={paymentLoading} emptyMessage="No payment events to show yet" />
            </TabsContent>

            <TabsContent value="flow" className="mt-4 space-y-3">
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                Search by business flow ID, order ID, payment ID, or order number to see related steps across services.
              </div>
              <SearchBar label="Flow, order, or payment ID" placeholder="Paste an order ID, payment ID, order number, or flow ID" value={flowId} onChange={setFlowId} onSearch={() => void loadFlow()} loading={flowLoading} />
              {flowTimeline.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{flowTimeline.length} recorded events</span>
                  {servicesInFlow.length > 0 && <span>Services: {servicesInFlow.join(', ')}</span>}
                </div>
              )}
              <TimelineView entries={flowTimeline} loading={flowLoading} emptyMessage="No flow events to show yet" />
            </TabsContent>

            <TabsContent value="order-time"><StateAtView kind="order" initialId={orderId} /></TabsContent>
            <TabsContent value="payment-time"><StateAtView kind="payment" initialId={paymentId} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
