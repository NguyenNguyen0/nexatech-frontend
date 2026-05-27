import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertCircle, Boxes, CreditCard, DollarSign, MapPin, Package, RefreshCw, Search, Star, Store, Truck } from 'lucide-react'

import { Layout } from '@/components/custom/layout'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAdminDashboardData, type DashboardData } from '@/services/dashboardApi'
import { markReviewHelpful } from '@/services/reviewApi'
import type { AuditLogRecord } from '@/services/auditApi'
import type { InventoryItem, ProductMinimal } from '@/types/catalog'

const money = (value?: number | null) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value ?? 0))

const number = (value?: number | null) => new Intl.NumberFormat('en-US').format(Number(value ?? 0))

const dateTime = (value?: string) => {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const pct = (current?: number | null, previous?: number | null) => {
  const curr = Number(current ?? 0)
  const prev = Number(previous ?? 0)
  if (prev === 0) return curr > 0 ? '+100%' : '0%'
  const value = ((curr - prev) / prev) * 100
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

const statusTone = (status?: string) => {
  if (!status) return 'secondary'
  if (['COMPLETED', 'DELIVERED', 'CONFIRMED', 'IN_STOCK', 'SUCCESS', 'ACTIVE'].includes(status)) return 'outline'
  if (['FAILED', 'CANCELLED', 'OUT_OF_STOCK'].includes(status)) return 'destructive'
  return 'secondary'
}

const chartColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#64748b']

function StatCard({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string
  value: string
  note: string
  icon: typeof DollarSign
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

function LoadingDashboard() {
  return (
    <Layout fixed>
      <Layout.Body className="min-h-0 overflow-y-auto md:overflow-y-auto">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading live dashboard data...
          </div>
        </div>
      </Layout.Body>
    </Layout>
  )
}

function EmptyRows({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  )
}

function RevenueChart({ data }: { data: { date: string; revenue: number; orderCount?: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}M`} />
        <Tooltip formatter={(value) => money(Number(value))} />
        <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revenueFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function periodLabel(data: DashboardData) {
  const days = Math.max(1, Math.round((new Date(data.range.to).getTime() - new Date(data.range.from).getTime()) / 86400000) + 1)
  return `vs previous ${days} days`
}

function KeyMetrics({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Revenue"
        value={money(data.orders.stats?.totalRevenue ?? data.payments.stats?.totalRevenue)}
        note={`${pct(data.orders.stats?.totalRevenue, data.orders.previousStats?.totalRevenue)} ${periodLabel(data)}`}
        icon={DollarSign}
      />
      <StatCard
        title="Orders"
        value={number(data.orders.stats?.totalOrders)}
        note={`${pct(data.orders.stats?.totalOrders, data.orders.previousStats?.totalOrders)} ${periodLabel(data)}`}
        icon={Package}
      />
      <StatCard
        title="Payments"
        value={number(data.payments.stats?.totalPayments || data.payments.total)}
        note={`${pct(data.payments.stats?.totalPayments || data.payments.total, data.payments.previousStats?.totalPayments)} ${periodLabel(data)}`}
        icon={CreditCard}
      />
      <StatCard
        title="Low stock"
        value={number(data.inventory.lowStock.length)}
        note={data.inventory.total > 0 ? `${number(data.inventory.total)} inventory records monitored` : `${number(data.catalog.productTotal)} catalog products loaded`}
        icon={Boxes}
      />
    </div>
  )
}

function OperationalSnapshot({ data }: { data: DashboardData }) {
  const pendingOrders = Number(data.orders.stats?.ordersByStatus?.PENDING ?? 0)
  const completedPayments = Number(data.payments.stats?.byStatus?.COMPLETED ?? 0)
  const deliveredShipments = data.shipping.shipments.filter((shipment) => shipment.status === 'DELIVERED').length
  const averageOrderValue = Number(data.orders.stats?.averageOrderValue ?? 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Average order value</CardTitle></CardHeader>
        <CardContent><div className="text-xl font-semibold">{money(averageOrderValue)}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending orders</CardTitle></CardHeader>
        <CardContent><div className="text-xl font-semibold">{number(pendingOrders)}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed payments</CardTitle></CardHeader>
        <CardContent><div className="text-xl font-semibold">{number(completedPayments)}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Delivered shipments</CardTitle></CardHeader>
        <CardContent><div className="text-xl font-semibold">{number(deliveredShipments)}</div></CardContent>
      </Card>
    </div>
  )
}

function OverviewTab({ data }: { data: DashboardData }) {
  const revenue = data.orders.stats?.revenueByDay ?? []
  const orderStatuses = data.orders.stats?.ordersByStatus ?? {}
  const activeShipments = data.shipping.shipments.filter((shipment) => !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(shipment.status))
  const attentionInventory = data.inventory.lowStock.slice(0, 5)
  const paymentIssues = data.payments.recent.filter((payment) => ['FAILED', 'REFUNDED'].includes(payment.status)).slice(0, 5)

  return (
    <div className="space-y-4">
      <KeyMetrics data={data} />
      <OperationalSnapshot data={data} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Orders recorded from {data.range.from} to {data.range.to}</CardDescription>
          </CardHeader>
          <CardContent>{revenue.length ? <RevenueChart data={revenue} /> : <div className="py-16 text-center text-sm text-muted-foreground">No revenue data yet.</div>}</CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Recent payments</CardTitle>
            <CardDescription>Latest payment records from payment-service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.payments.recent.length === 0 && <p className="text-sm text-muted-foreground">No payments to show.</p>}
            {data.payments.recent.slice(0, 6).map((payment) => (
              <div key={payment.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{payment.method}</p>
                  <p className="truncate text-xs text-muted-foreground">{payment.orderId}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{money(payment.amount)}</div>
                  <Badge variant={statusTone(payment.status)}>{payment.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment pipeline</CardTitle>
            <CardDescription>Where orders are sitting right now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => {
              const value = Number(orderStatuses[status] ?? 0)
              const total = Number(data.orders.stats?.totalOrders ?? 0)
              const progress = total > 0 ? Math.min(100, (value / total) * 100) : 0
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{status.replaceAll('_', ' ')}</span>
                    <span className="font-medium">{number(value)}</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory attention</CardTitle>
            <CardDescription>Stock records that may block future orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attentionInventory.length === 0 && <p className="text-sm text-muted-foreground">No low-stock products in the loaded inventory.</p>}
            {attentionInventory.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.productName || item.sku}</div>
                  <div className="text-xs text-muted-foreground">{item.sku} - {item.warehouseLocation || 'Unassigned'}</div>
                </div>
                <div className="text-right">
                  <Badge variant={statusTone(item.status)}>{item.status.replaceAll('_', ' ')}</Badge>
                  <div className="mt-1 text-xs text-muted-foreground">{number(item.availableQuantity)} available</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational alerts</CardTitle>
            <CardDescription>Payments and shipments that may need follow-up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Active shipments</div>
                <div className="mt-1 text-2xl font-semibold">{number(activeShipments.length)}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Payment issues</div>
                <div className="mt-1 text-2xl font-semibold">{number(paymentIssues.length)}</div>
              </div>
            </div>
            <div className="space-y-2">
              {activeShipments.slice(0, 3).map((shipment) => (
                <div key={shipment.trackingCode} className="flex items-center justify-between rounded-md bg-muted/35 px-3 py-2 text-sm">
                  <span className="truncate">{shipment.trackingCode}</span>
                  <Badge variant={statusTone(shipment.status)}>{shipment.status.replaceAll('_', ' ')}</Badge>
                </div>
              ))}
              {paymentIssues.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-md bg-muted/35 px-3 py-2 text-sm">
                  <span className="truncate">{payment.method} - {money(payment.amount)}</span>
                  <Badge variant={statusTone(payment.status)}>{payment.status}</Badge>
                </div>
              ))}
              {activeShipments.length === 0 && paymentIssues.length === 0 && (
                <p className="text-sm text-muted-foreground">No obvious payment or shipment issues in the loaded records.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AnalyticsTab({ data }: { data: DashboardData }) {
  const methodData = Object.entries(data.payments.stats?.byMethod ?? {}).map(([name, value]) => ({ name, value }))
  const statusData = Object.entries(data.orders.stats?.ordersByStatus ?? {}).map(([name, value]) => ({ name, value }))
  const topProducts = data.orders.stats?.topProducts ?? []

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Payment methods</CardTitle>
          <CardDescription>How customers paid in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {methodData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No payment method data for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={methodData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                  {methodData.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2">
            {methodData.map((item, index) => (
              <Badge key={item.name} variant="secondary" style={{ borderColor: chartColors[index % chartColors.length] }}>
                {item.name}: {number(item.value)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order status</CardTitle>
          <CardDescription>Current mix of orders created in the period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top products</CardTitle>
          <CardDescription>Best sellers from order-service statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 && <EmptyRows message="No top-product data yet." />}
              {topProducts.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">{product.productName || product.productId}</TableCell>
                  <TableCell className="text-right">{number(product.totalQuantity)}</TableCell>
                  <TableCell className="text-right">{money(product.totalRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ReportsTab({ data }: { data: DashboardData }) {
  const [selectedId, setSelectedId] = useState(data.orders.recent[0]?.id ?? '')
  const selected = data.orders.recent.find((order) => order.id === selectedId) ?? data.orders.recent[0]
  const revenue = data.orders.stats?.revenueByDay ?? []
  const orderStatusData = Object.entries(data.orders.stats?.ordersByStatus ?? {})
    .filter(([, value]) => Number(value) > 0)
    .map(([name, value]) => ({ name, value }))
  const paymentStatusData = Object.entries(data.payments.stats?.byStatus ?? {})
    .filter(([, value]) => Number(value) > 0)
    .map(([name, value]) => ({ name, value }))

  useEffect(() => {
    if (!selectedId && data.orders.recent[0]) setSelectedId(data.orders.recent[0].id)
  }, [data.orders.recent, selectedId])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Live records from order-service</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.orders.recent.length === 0 && <EmptyRows message="No orders to show." />}
                {data.orders.recent.map((order) => (
                  <TableRow key={order.id} className={selected?.id === order.id ? 'bg-muted/50' : ''} onClick={() => setSelectedId(order.id)}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.guestName || order.customerId}</TableCell>
                    <TableCell><Badge variant={statusTone(order.status)}>{order.status}</Badge></TableCell>
                    <TableCell>{dateTime(order.createdAt)}</TableCell>
                    <TableCell className="text-right">{money(order.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order detail</CardTitle>
            <CardDescription>{selected ? selected.orderNumber : 'Select an order'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selected && <p className="text-sm text-muted-foreground">No order selected.</p>}
            {selected && (
              <>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={statusTone(selected.status)}>{selected.status}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{selected.paymentMethod}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{money(selected.shippingFee)}</span></div>
                  <div className="flex justify-between font-medium"><span>Total</span><span>{money(selected.totalAmount)}</span></div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Items</div>
                  {selected.items?.map((item) => (
                    <div key={item.id} className="flex justify-between rounded border p-2 text-sm">
                      <span>{item.productName} x {item.quantity}</span>
                      <span>{money(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/admin/audit/trace?orderId=${selected.id}`}>Open trace log</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue and order volume</CardTitle>
            <CardDescription>Daily revenue with order count for the selected range</CardDescription>
          </CardHeader>
          <CardContent>
            {revenue.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No report data for this range.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}M`} />
                  <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value, name) => name === 'revenue' ? money(Number(value)) : number(Number(value))} />
                  <Bar yAxisId="left" dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="orderCount" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status overview</CardTitle>
            <CardDescription>Order and payment health in one view</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                ...orderStatusData.map((item) => ({ ...item, group: 'Orders' })),
                ...paymentStatusData.map((item) => ({ ...item, group: 'Payments' })),
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {[...orderStatusData, ...paymentStatusData].map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function NotificationsTab({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest business events recorded across services</CardDescription>
        </CardHeader>
        <CardContent>
          {data.audit.recent.length === 0 && <p className="text-sm text-muted-foreground">No audit events to show.</p>}
          <div className="relative space-y-0 pl-6">
            <div className="absolute bottom-3 left-2 top-3 w-px bg-border" />
            {data.audit.recent.map((event: AuditLogRecord) => (
              <div key={event.id} className="relative pb-4 last:pb-0">
                <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <div className="rounded-md border bg-background p-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{event.action.replaceAll('_', ' ')}</Badge>
                      {event.sourceService && (
                        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {event.sourceService.replace('-service', '')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{dateTime(event.createdAt ?? event.timestamp)}</span>
                  </div>
                  <div className="mt-2 text-sm font-medium">{event.message || event.entityLabel || 'Recorded activity'}</div>
                  {(event.entityType || event.entityId) && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {[event.entityType, event.entityId].filter(Boolean).join(' - ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReviewsTab({ data, onRefresh }: { data: DashboardData; onRefresh: () => void }) {
  const [query, setQuery] = useState('')
  const filtered = data.reviews.items.filter((review) => `${review.productName ?? ''} ${review.title ?? ''} ${review.content ?? ''} ${review.userId}`.toLowerCase().includes(query.toLowerCase()))

  const helpful = async (id: string) => {
    await markReviewHelpful(id)
    onRefresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer reviews</CardTitle>
        <CardDescription>Live review records from product-service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search reviews..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Helpful</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <EmptyRows message="No reviews to show." />}
            {filtered.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.productName || review.productId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {review.rating}/5</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{review.title || 'Untitled review'}</div>
                  <div className="max-w-xl text-sm text-muted-foreground">{review.content}</div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => void helpful(review.id)}>
                    {number(review.helpfulCount)}
                  </Button>
                </TableCell>
                <TableCell>{dateTime(review.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function CampaignSignalsTab({ data }: { data: DashboardData }) {
  const products = data.orders.stats?.topProducts ?? []
  const catalogSpotlight = data.catalog.products
    .filter((product) => product.active !== false)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      const ratingDelta = Number(b.averageRating ?? 0) - Number(a.averageRating ?? 0)
      if (ratingDelta !== 0) return ratingDelta
      return Number(b.reviewCount ?? 0) - Number(a.reviewCount ?? 0)
    })
    .slice(0, 10)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Campaign signals</CardTitle>
          <CardDescription>Products with sales momentum from order-service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {products.length === 0 && <p className="text-sm text-muted-foreground">No sales signals yet.</p>}
          {products.map((product, index) => (
            <div key={product.productId} className="space-y-2 rounded-md border p-3">
              <div className="flex justify-between gap-2">
                <div className="font-medium">{product.productName || product.productId}</div>
                <Badge variant="secondary">Rank #{index + 1}</Badge>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{number(product.totalQuantity)} units sold</span>
                <span>{money(product.totalRevenue)}</span>
              </div>
              <Progress value={Math.min(100, product.totalQuantity * 10)} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Catalog spotlight</CardTitle>
          <CardDescription>Active products ranked by featured flag, rating, and review count</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {catalogSpotlight.length === 0 && <p className="text-sm text-muted-foreground">No catalog products loaded yet.</p>}
          {catalogSpotlight.map((product: ProductMinimal) => (
            <div key={product.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{product.name}</div>
                  {product.featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{product.brandName || product.primaryCategoryName || product.sku}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{money(product.price)}</div>
                <div className="text-xs text-muted-foreground">
                  {Number(product.averageRating ?? 0).toFixed(1)} rating - {number(product.reviewCount)} reviews
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function WarehouseLocationsTab({ data }: { data: DashboardData }) {
  const locations = useMemo(() => {
    const map = new Map<string, { name: string; total: number; low: number; quantity: number; items: InventoryItem[] }>()
    for (const item of data.inventory.items) {
      const key = item.warehouseLocation || 'Unassigned'
      const current = map.get(key) ?? { name: key, total: 0, low: 0, quantity: 0, items: [] }
      current.total += 1
      current.quantity += item.quantity
      current.items.push(item)
      if (item.status !== 'IN_STOCK') current.low += 1
      map.set(key, current)
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [data.inventory.items])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse locations</CardTitle>
        <CardDescription>Inventory grouped by warehouse location from inventory-service</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Attention needed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 && <EmptyRows message="No warehouse locations found." />}
            {locations.map((location) => (
              <TableRow key={location.name}>
                <TableCell>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {location.name}</div>
                </TableCell>
                <TableCell className="text-right">{number(location.total)}</TableCell>
                <TableCell className="text-right">{number(location.quantity)}</TableCell>
                <TableCell className="text-right">{location.low > 0 ? <Badge variant="destructive">{location.low} items</Badge> : <Badge variant="outline">OK</Badge>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function BrandSuppliersTab({ data }: { data: DashboardData }) {
  const brandProductCount = new Map<string, number>()
  for (const product of data.catalog.products) {
    if (!product.brandId) continue
    brandProductCount.set(product.brandId, (brandProductCount.get(product.brandId) ?? 0) + 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand suppliers</CardTitle>
        <CardDescription>Brand records and catalog coverage from product-service</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Products loaded</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.catalog.brands.length === 0 && <EmptyRows message="No brands found." />}
            {data.catalog.brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <div className="flex items-center gap-2"><Store className="h-4 w-4 text-muted-foreground" /> {brand.name}</div>
                </TableCell>
                <TableCell><Badge variant={brand.active ? 'outline' : 'secondary'}>{brand.active ? 'ACTIVE' : 'INACTIVE'}</Badge></TableCell>
                <TableCell className="text-right">{number(brandProductCount.get(brand.id) ?? 0)}</TableCell>
                <TableCell>{dateTime(brand.updatedAt ?? brand.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ShippingTab({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping operations</CardTitle>
        <CardDescription>Latest shipments from shipping-service</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.shipping.shipments.length === 0 && <EmptyRows message="No shipments to show." />}
            {data.shipping.shipments.map((shipment) => (
              <TableRow key={shipment.trackingCode}>
                <TableCell className="font-medium">{shipment.trackingCode}</TableCell>
                <TableCell>{shipment.provider}</TableCell>
                <TableCell><Badge variant={statusTone(shipment.status)}>{shipment.status}</Badge></TableCell>
                <TableCell>{shipment.customerName || shipment.orderId}</TableCell>
                <TableCell className="text-right">{money(shipment.shippingFee)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10)
  const defaultFrom = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(today)

  const load = async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    try {
      setData(await getAdminDashboardData({ from, to, forceRefresh }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (loading && !data) return <LoadingDashboard />

  return (
    <Layout fixed>
      <Layout.Body className="min-h-0 overflow-y-auto md:overflow-y-auto">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            {data && <p className="text-sm text-muted-foreground">Live business data from {data.range.from} to {data.range.to}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">From</label>
              <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-9 w-[150px]" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">To</label>
              <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-9 w-[150px]" />
            </div>
            <Button variant="outline" onClick={() => void load(false)} disabled={loading || !from || !to}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Apply
            </Button>
            <Button onClick={() => void load(true)} disabled={loading || !from || !to}>
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {data && (
          <Tabs defaultValue="overview" className="space-y-4">
            <div className="w-full overflow-x-auto pb-2">
              <TabsList className="h-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="reviews">Customer reviews</TabsTrigger>
                <TabsTrigger value="campaigns">Campaign signals</TabsTrigger>
                <TabsTrigger value="locations">Warehouse locations</TabsTrigger>
                <TabsTrigger value="suppliers">Brand suppliers</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview"><OverviewTab data={data} /></TabsContent>
            <TabsContent value="analytics"><AnalyticsTab data={data} /></TabsContent>
            <TabsContent value="reports"><ReportsTab data={data} /></TabsContent>
            <TabsContent value="notifications"><NotificationsTab data={data} /></TabsContent>
            <TabsContent value="reviews"><ReviewsTab data={data} onRefresh={() => void load(true)} /></TabsContent>
            <TabsContent value="campaigns"><CampaignSignalsTab data={data} /></TabsContent>
            <TabsContent value="locations"><WarehouseLocationsTab data={data} /></TabsContent>
            <TabsContent value="suppliers"><BrandSuppliersTab data={data} /></TabsContent>
            <TabsContent value="shipping"><ShippingTab data={data} /></TabsContent>
          </Tabs>
        )}
      </Layout.Body>
    </Layout>
  )
}
