import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Eye,
  MapPin,
  MoreVertical,
  Package,
  RefreshCw,
  Search,
  Truck,
  User,
} from 'lucide-react'

import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  type OrderResponse,
  type OrderStatus,
} from '@/services/orderApi'
import {
  getPaymentByOrderId,
  type PaymentResponse,
  type PaymentStatus,
} from '@/services/paymentApi'
import {
  getOptionalShipmentTracking,
  type ShipmentStatus,
  type TrackingInfo,
} from '@/services/shippingApi'

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SHIPPED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  OUT_OF_STOCK: 'bg-amber-100 text-amber-800 border-amber-200',
  SHIPPING_FAILED: 'bg-red-100 text-red-800 border-red-200',
  REFUND_PENDING: 'bg-purple-100 text-purple-800 border-purple-200',
  RETURNED: 'bg-orange-100 text-orange-800 border-orange-200',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
}

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
}

const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  PENDING_PICKUP: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PICKED_UP: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  RETURNED: 'bg-orange-100 text-orange-800 border-orange-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
}

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'OUT_OF_STOCK',
  'SHIPPING_FAILED',
  'REFUND_PENDING',
  'RETURNED',
  'REFUNDED',
]

const NEXT_ORDER_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED', 'RETURNED'],
  COMPLETED: [],
  CANCELLED: ['REFUND_PENDING', 'REFUNDED'],
  OUT_OF_STOCK: ['REFUND_PENDING', 'REFUNDED'],
  SHIPPING_FAILED: ['REFUND_PENDING', 'REFUNDED'],
  REFUND_PENDING: ['REFUNDED'],
  RETURNED: ['REFUNDED'],
  REFUNDED: [],
}

type OrderEnrichment = {
  payment: PaymentResponse | null
  shipment: TrackingInfo | null
}

const PAGE_SIZE = 15

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value ?? 0)

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

const shortId = (value?: string | null, length = 8) =>
  value ? `${value.slice(0, length)}${value.length > length ? '...' : ''}` : '-'

const customerLabel = (order: OrderResponse) =>
  order.guestName || order.guestEmail || order.guestPhone || shortId(order.customerId, 12)

const resolveShipmentForOrder = (order: OrderResponse): Promise<TrackingInfo | null> => {
  if (order.trackingNumber) {
    return getOptionalShipmentTracking(order.trackingNumber).catch(() => null)
  }

  return Promise.resolve(null)
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: typeof Package
}) {
  return (
    <Card>
      <CardContent className='flex items-center justify-between p-4'>
        <div>
          <p className='text-xs font-medium text-muted-foreground'>{title}</p>
          <p className='mt-1 text-xl font-semibold'>{value}</p>
        </div>
        <div className='flex h-9 w-9 items-center justify-center rounded-md bg-muted'>
          <Icon className='h-4 w-4 text-muted-foreground' />
        </div>
      </CardContent>
    </Card>
  )
}

function OrderDetailDialog({
  order,
  enrichment,
  onClose,
  onStatusChange,
}: {
  order: OrderResponse | null
  enrichment?: OrderEnrichment
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>
}) {
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(false)
  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('')

  useEffect(() => {
    if (order) setNextStatus('')
  }, [order])

  if (!order) return null

  const payment = enrichment?.payment
  const shipment = enrichment?.shipment

  const handleUpdate = async () => {
    if (!nextStatus) return
    setUpdating(true)
    try {
      await onStatusChange(order.id, nextStatus)
      toast.success('Order updated', {
        description: `${order.orderNumber} changed to ${nextStatus}.`,
      })
      onClose()
    } catch (error: unknown) {
      toast.error('Unable to update order', {
        description: (error as Error).message,
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Dialog open={Boolean(order)} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] w-[96vw] overflow-y-auto sm:max-w-[1280px]'>
        <DialogHeader>
          <DialogTitle className='flex flex-wrap items-center gap-2'>
            Order {order.orderNumber}
            <Badge className={ORDER_STATUS_COLORS[order.status]}>{order.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Review order items, customer details, payment, shipping, status updates, and trace log access.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 lg:grid-cols-[1.4fr_0.9fr]'>
          <div className='space-y-4'>
            <Card>
              <CardHeader className='px-4 py-3'>
                <CardTitle className='flex items-center gap-2 text-sm'>
                  <Package className='h-4 w-4' />
                  Order items
                </CardTitle>
              </CardHeader>
              <CardContent className='px-4 pb-4'>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className='text-right'>Qty</TableHead>
                        <TableHead className='text-right'>Unit price</TableHead>
                        <TableHead className='text-right'>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className='font-medium'>{item.productName}</div>
                            <div className='font-mono text-xs text-muted-foreground'>{item.productId}</div>
                          </TableCell>
                          <TableCell className='text-right'>{item.quantity}</TableCell>
                          <TableCell className='text-right'>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className='text-right font-medium'>{formatCurrency(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className='ml-auto mt-3 max-w-xs space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Shipping fee</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                  <div className='flex justify-between border-t pt-2 text-base font-semibold'>
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='px-4 py-3'>
                <CardTitle className='flex items-center gap-2 text-sm'>
                  <Truck className='h-4 w-4' />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3 px-4 pb-4 text-sm md:grid-cols-2'>
                <div className='md:col-span-2'>
                  <p className='text-muted-foreground'>Ship to</p>
                  <p className='mt-1'>{order.shippingAddress || '-'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Method</p>
                  <p className='mt-1'>{order.shippingMethod || '-'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Shipment status</p>
                  {shipment ? (
                    <Badge className={SHIPMENT_STATUS_COLORS[shipment.status]}>{shipment.status}</Badge>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div>
                  <p className='text-muted-foreground'>Carrier</p>
                  <p className='mt-1'>{shipment?.provider || order.carrierName || '-'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Tracking code</p>
                  <p className='mt-1 font-mono text-xs'>{shipment?.trackingCode || order.trackingNumber || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-4'>
            <Card>
              <CardHeader className='px-4 py-3'>
                <CardTitle className='flex items-center gap-2 text-sm'>
                  <User className='h-4 w-4' />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 px-4 pb-4 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Name / ID</p>
                  <p className='mt-1 font-medium'>{customerLabel(order)}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Email</p>
                  <p className='mt-1'>{order.guestEmail || '-'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Phone</p>
                  <p className='mt-1'>{order.guestPhone || '-'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Customer ID</p>
                  <p className='mt-1 break-all font-mono text-xs'>{order.customerId || 'guest'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='px-4 py-3'>
                <CardTitle className='flex items-center gap-2 text-sm'>
                  <CreditCard className='h-4 w-4' />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 px-4 pb-4 text-sm'>
                <div className='flex items-center justify-between gap-3'>
                  <span className='text-muted-foreground'>Method</span>
                  <span className='font-medium'>{payment?.method || order.paymentMethod}</span>
                </div>
                <div className='flex items-center justify-between gap-3'>
                  <span className='text-muted-foreground'>Status</span>
                  {payment ? (
                    <Badge className={PAYMENT_STATUS_COLORS[payment.status]}>{payment.status}</Badge>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div>
                  <p className='text-muted-foreground'>Payment ID</p>
                  <p className='mt-1 break-all font-mono text-xs'>{payment?.id || '-'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Transaction ID</p>
                  <p className='mt-1 break-all font-mono text-xs'>{payment?.transactionId || '-'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='px-4 py-3'>
                <CardTitle className='text-sm'>Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 px-4 pb-4'>
                <Select value={nextStatus} onValueChange={(value) => setNextStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Change status...' />
                  </SelectTrigger>
                  <SelectContent>
                    {NEXT_ORDER_STATUSES[order.status].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className='flex flex-wrap gap-2'>
                  <Button size='sm' disabled={!nextStatus || updating} onClick={handleUpdate}>
                    {updating ? 'Updating...' : 'Update'}
                  </Button>
                  <Button size='sm' variant='outline' onClick={() => navigate(`/admin/audit/trace?orderId=${order.id}`)}>
                    <ClipboardList className='mr-1 h-4 w-4' />
                    Trace log
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EnhancedOrderManagement() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [enrichment, setEnrichment] = useState<Record<string, OrderEnrichment>>({})
  const [loading, setLoading] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await adminGetAllOrders({
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      })
      setOrders(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch (error: unknown) {
      toast.error('Unable to load orders', {
        description: (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    setPage(0)
  }, [statusFilter])

  useEffect(() => {
    if (orders.length === 0) {
      setEnrichment({})
      return
    }

    let cancelled = false
    setEnriching(true)
    Promise.all(
      orders.map(async (order) => {
        const [payment, shipment] = await Promise.all([
          getPaymentByOrderId(order.id).catch(() => null),
          resolveShipmentForOrder(order),
        ])
        return [order.id, { payment, shipment }] as const
      }),
    )
      .then((entries) => {
        if (!cancelled) setEnrichment(Object.fromEntries(entries))
      })
      .finally(() => {
        if (!cancelled) setEnriching(false)
      })

    return () => {
      cancelled = true
    }
  }, [orders])

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const updated = await adminUpdateOrderStatus(orderId, status)
    setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)))
    if (selectedOrder?.id === orderId) setSelectedOrder(updated)
  }

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return orders
    return orders.filter((order) => {
      const payment = enrichment[order.id]?.payment
      const shipment = enrichment[order.id]?.shipment
      return [
        order.id,
        order.orderNumber,
        order.customerId,
        order.guestName,
        order.guestEmail,
        order.guestPhone,
        payment?.id,
        shipment?.trackingCode,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
  }, [enrichment, orders, search])

  const pageTotal = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
  const paidCount = orders.filter((order) => enrichment[order.id]?.payment?.status === 'COMPLETED').length
  const shippedCount = orders.filter((order) => enrichment[order.id]?.shipment).length

  return (
    <div className='space-y-4 p-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold'>Order Management</h2>
          <p className='text-sm text-muted-foreground'>
            Orders enriched with payment and shipping data through Kong.
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className='grid gap-3 md:grid-cols-4'>
        <MetricCard title='Total orders' value={String(totalElements)} icon={Package} />
        <MetricCard title='Amount on page' value={formatCurrency(pageTotal)} icon={Banknote} />
        <MetricCard title='Paid orders' value={`${paidCount}/${orders.length}`} icon={CreditCard} />
        <MetricCard title='Shipments' value={`${shippedCount}/${orders.length}`} icon={Truck} />
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'ALL')}>
          <TabsList className='h-auto flex-wrap gap-1'>
            <TabsTrigger value='ALL'>All</TabsTrigger>
            {ALL_ORDER_STATUSES.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className='relative min-w-72 flex-1 md:max-w-sm'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            className='pl-9'
            placeholder='Search order, customer, payment, tracking...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead className='text-right'>Total</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 8 }).map((__, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className='h-4 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='py-10 text-center text-muted-foreground'>
                  No matching orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const detail = enrichment[order.id]
                const trackingCode = detail?.shipment?.trackingCode
                return (
                  <TableRow
                    key={order.id}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell>
                      <div className='font-mono font-medium'>{order.orderNumber}</div>
                      <div className='text-xs text-muted-foreground'>{order.items.length} items</div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-52 truncate font-medium'>{customerLabel(order)}</div>
                      <div className='max-w-52 truncate text-xs text-muted-foreground'>{order.guestPhone || order.customerId || 'guest'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={ORDER_STATUS_COLORS[order.status]}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1'>
                        <span className='text-sm'>{detail?.payment?.method || order.paymentMethod}</span>
                        {detail?.payment ? (
                          <Badge className={`w-fit ${PAYMENT_STATUS_COLORS[detail.payment.status]}`}>{detail.payment.status}</Badge>
                        ) : (
                          <span className='text-xs text-muted-foreground'>{enriching ? 'Loading...' : 'No payment'}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {detail?.shipment ? (
                        <div className='flex flex-col gap-1'>
                          <Badge className={`w-fit ${SHIPMENT_STATUS_COLORS[detail.shipment.status]}`}>{detail.shipment.status}</Badge>
                          <span className='font-mono text-xs text-muted-foreground'>{detail.shipment.trackingCode}</span>
                        </div>
                      ) : (
                        <span className='text-xs text-muted-foreground'>{enriching ? 'Loading...' : 'No shipment'}</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right font-medium'>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1 text-muted-foreground'>
                        <CalendarClock className='h-3.5 w-3.5' />
                        {formatDate(order.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={(event) => { event.stopPropagation(); setSelectedOrder(order) }}>
                            <Eye className='mr-2 h-4 w-4' />
                            View details
                          </DropdownMenuItem>
                          {trackingCode && (
                            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); window.location.href = `/admin/shipping?trackingCode=${trackingCode}` }}>
                              <MapPin className='mr-2 h-4 w-4' />
                              Track shipment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(event) => { event.stopPropagation(); window.location.href = `/admin/audit/trace?orderId=${order.id}` }}>
                            <ClipboardList className='mr-2 h-4 w-4' />
                            Trace log
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>
            Page {page + 1} / {totalPages}
          </span>
          <div className='flex gap-1'>
            <Button variant='outline' size='icon' disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='icon' disabled={page >= totalPages - 1} onClick={() => setPage((value) => value + 1)}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      <OrderDetailDialog
        order={selectedOrder}
        enrichment={selectedOrder ? enrichment[selectedOrder.id] : undefined}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
