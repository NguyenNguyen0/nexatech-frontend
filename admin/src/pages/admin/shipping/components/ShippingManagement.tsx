import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/custom/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
import type { OrderResponse } from '@/services/orderApi'
import {
  cancelShipment,
  getShipments,
  getShipmentTracking,
  type ShipmentStatus,
  type TrackingInfo,
} from '@/services/shippingApi'

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  PENDING_PICKUP: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PICKED_UP: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  RETURNED: 'bg-orange-100 text-orange-800 border-orange-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
}

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING_PICKUP: 'Pending pickup',
  PICKED_UP: 'Picked up',
  IN_TRANSIT: 'In transit',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
}

const ALL_STATUSES: ShipmentStatus[] = [
  'PENDING_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED',
  'RETURNED',
  'CANCELLED',
]

type ShipmentRow = {
  order: OrderResponse
  shipment: TrackingInfo
}

const PAGE_SIZE = 20

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

const customerLabel = (order: OrderResponse) =>
  order.guestName || order.guestEmail || order.guestPhone || order.customerId || 'Guest customer'

const orderStatusFromShipment = (status: ShipmentStatus): OrderResponse['status'] => {
  if (status === 'DELIVERED') return 'DELIVERED'
  if (status === 'CANCELLED') return 'CANCELLED'
  if (status === 'RETURNED') return 'RETURNED'
  if (status === 'PENDING_PICKUP') return 'PROCESSING'
  return 'SHIPPED'
}

const orderFromShipment = (shipment: TrackingInfo): OrderResponse => {
  const shortOrderId = shipment.orderId ? shipment.orderId.slice(0, 8).toUpperCase() : '-'

  return {
    id: shipment.orderId ?? '',
    orderNumber: shortOrderId,
    customerId: '',
    status: orderStatusFromShipment(shipment.status),
    guestName: shipment.customerName,
    guestPhone: shipment.customerPhone,
    totalAmount: 0,
    shippingFee: Number(shipment.shippingFee ?? 0),
    discount: 0,
    shippingAddress: shipment.customerAddress ?? '',
    shippingMethod: shipment.provider,
    paymentMethod: 'COD',
    items: [],
    createdAt: shipment.createdAt ?? '',
    trackingNumber: shipment.trackingCode,
    carrierName: shipment.provider,
  }
}

function TrackingDetail({
  row,
  onCancel,
}: {
  row: ShipmentRow
  onCancel: (trackingCode: string) => Promise<void>
}) {
  const navigate = useNavigate()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const { order, shipment } = row
  const canCancel = !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(shipment.status)

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await onCancel(shipment.trackingCode)
      setConfirmCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Truck className='h-4 w-4' />
                {shipment.trackingCode}
              </CardTitle>
              <p className='mt-1 text-xs text-muted-foreground'>
                Order {order.orderNumber} · {shipment.provider}
              </p>
            </div>
            <Badge className={STATUS_COLORS[shipment.status]}>
              {STATUS_LABELS[shipment.status] ?? shipment.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='grid gap-3 text-sm md:grid-cols-3'>
            <div>
              <p className='text-muted-foreground'>Customer</p>
              <p className='mt-1 font-medium'>{customerLabel(order)}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Phone</p>
              <p className='mt-1'>{order.guestPhone || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Order created</p>
              <p className='mt-1'>{formatDate(order.createdAt)}</p>
            </div>
            <div className='md:col-span-3'>
              <p className='text-muted-foreground'>Ship to</p>
              <p className='mt-1'>{order.shippingAddress || '-'}</p>
            </div>
            <div className='md:col-span-3'>
              <p className='text-muted-foreground'>Current location</p>
              <p className='mt-1 flex items-center gap-1'>
                <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
                {shipment.currentLocation?.address ||
                  `${shipment.currentLocation?.lat ?? '-'}, ${shipment.currentLocation?.lng ?? '-'}`}
              </p>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            {canCancel && (
              <Button size='sm' variant='destructive' onClick={() => setConfirmCancel(true)}>
                <XCircle className='mr-1 h-4 w-4' />
                Cancel shipment
              </Button>
            )}
            <Button size='sm' variant='outline' onClick={() => navigate('/admin/order')}>
              <PackageCheck className='mr-1 h-4 w-4' />
              View order
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
              <Clock className='h-4 w-4' />
              Tracking history ({shipment.histories.length})
            </h4>
            {shipment.histories.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No tracking events yet.</p>
            ) : (
              <ScrollArea className='h-64'>
                <div className='relative pl-5'>
                  <div className='absolute bottom-0 left-1.5 top-0 w-0.5 bg-border' />
                  {[...shipment.histories]
                    .sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime())
                    .map((history, index) => (
                      <div key={`${history.eventTime}-${index}`} className='relative mb-4'>
                        <div className='absolute -left-3.5 mt-1 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background' />
                        <div className='rounded-md border bg-card p-3'>
                          <div className='mb-1 flex flex-wrap items-center gap-2'>
                            <Badge className={`text-xs ${STATUS_COLORS[history.status]}`}>
                              {STATUS_LABELS[history.status] ?? history.status}
                            </Badge>
                            <span className='text-xs text-muted-foreground'>{formatDate(history.eventTime)}</span>
                          </div>
                          {history.locationAddress && (
                            <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                              <MapPin className='h-3 w-3' />
                              {history.locationAddress}
                            </p>
                          )}
                          {history.note && <p className='mt-1 text-xs'>{history.note}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel shipment?</AlertDialogTitle>
            <AlertDialogDescription>
              Shipment {shipment.trackingCode} will be cancelled through the shipping service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Processing...' : 'Confirm cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function ShippingManagement() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState<ShipmentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalShipmentPages, setTotalShipmentPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState(searchParams.get('trackingCode') ?? '')
  const [manualLookup, setManualLookup] = useState(searchParams.get('trackingCode') ?? '')
  const [selected, setSelected] = useState<ShipmentRow | null>(null)

  const fetchShipments = useCallback(async () => {
    setLoading(true)
    try {
      const shipmentPage = await getShipments({
        page,
        size: PAGE_SIZE,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sort: 'createdAt,desc',
      })
      setTotalShipmentPages(shipmentPage.totalPages)

      const nextRows = shipmentPage.content.map((shipment) => ({
        order: orderFromShipment(shipment),
        shipment,
      }))
      setRows(nextRows)

      const trackingCode = searchParams.get('trackingCode')
      if (trackingCode) {
        const found = nextRows.find((row) => row.shipment.trackingCode === trackingCode)
        if (found) setSelected(found)
      }
    } catch (error: unknown) {
      toast.error('Unable to load shipments', {
        description: (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }, [page, searchParams, statusFilter])

  useEffect(() => {
    fetchShipments()
  }, [fetchShipments])

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return rows.filter((row) => {
      const statusMatched = statusFilter === 'ALL' || row.shipment.status === statusFilter
      if (!statusMatched) return false
      if (!keyword) return true
      return [
        row.order.orderNumber,
        row.order.customerId,
        row.order.guestName,
        row.order.guestEmail,
        row.order.guestPhone,
        row.shipment.trackingCode,
        row.shipment.provider,
        row.order.shippingAddress,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
  }, [rows, search, statusFilter])

  const lookupTracking = async () => {
    const trackingCode = manualLookup.trim()
    if (!trackingCode) {
      toast.error('Enter a tracking code')
      return
    }

    setLoading(true)
    try {
      const shipment = await getShipmentTracking(trackingCode)
      const existing = rows.find((row) => row.shipment.trackingCode === shipment.trackingCode)
      if (existing) {
        setSelected({ ...existing, shipment })
        return
      }

      setSelected({ order: orderFromShipment(shipment), shipment })
    } catch (error: unknown) {
      toast.error('Shipment not found', {
        description: (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (trackingCode: string) => {
    const result = await cancelShipment(trackingCode)
    toast.success('Cancel request sent', { description: result.message })
    setRows((prev) =>
      prev.map((row) =>
        row.shipment.trackingCode === trackingCode
          ? { ...row, shipment: { ...row.shipment, status: result.status } }
          : row,
      ),
    )
    setSelected((prev) =>
      prev && prev.shipment.trackingCode === trackingCode
        ? { ...prev, shipment: { ...prev.shipment, status: result.status } }
        : prev,
    )
  }

  const selectRow = useCallback(async (row: ShipmentRow) => {
    setSelected(row)
    if (row.shipment.histories.length > 0) return

    try {
      const shipment = await getShipmentTracking(row.shipment.trackingCode)
      const nextRow = { ...row, shipment }
      setRows((prev) =>
        prev.map((item) =>
          item.shipment.trackingCode === shipment.trackingCode ? nextRow : item,
        ),
      )
      setSelected((prev) =>
        prev?.shipment.trackingCode === shipment.trackingCode ? nextRow : prev,
      )
    } catch {
      // Summary data is still useful if history lookup is temporarily unavailable.
    }
  }, [])

  return (
    <div className='space-y-4 p-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='flex items-center gap-2 text-xl font-semibold'>
            <Truck className='h-5 w-5' />
            Shipping Management
          </h2>
          <p className='text-sm text-muted-foreground'>
            Review shipment status, tracking history, and delivery exceptions from the shipping service.
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={fetchShipments} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className='grid gap-3 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs font-medium text-muted-foreground'>Shipments on page</p>
            <p className='mt-1 text-xl font-semibold'>{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs font-medium text-muted-foreground'>In transit</p>
            <p className='mt-1 text-xl font-semibold'>{rows.filter((row) => row.shipment.status === 'IN_TRANSIT').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs font-medium text-muted-foreground'>Delivered</p>
            <p className='mt-1 text-xl font-semibold'>{rows.filter((row) => row.shipment.status === 'DELIVERED').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs font-medium text-muted-foreground'>Needs attention</p>
            <p className='mt-1 text-xl font-semibold'>{rows.filter((row) => ['FAILED', 'RETURNED'].includes(row.shipment.status)).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className='flex flex-wrap items-end gap-3'>
        <Tabs
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as ShipmentStatus | 'ALL')
            setPage(0)
          }}
        >
          <TabsList className='h-auto flex-wrap gap-1'>
            <TabsTrigger value='ALL'>All</TabsTrigger>
            {ALL_STATUSES.map((status) => (
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
            placeholder='Search order, customer, tracking code...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.35fr_0.85fr]'>
        <div className='space-y-3'>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking code</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current location</TableHead>
                  <TableHead>Order created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, row) => (
                    <TableRow key={row}>
                      {Array.from({ length: 7 }).map((__, cell) => (
                        <TableCell key={cell}>
                          <Skeleton className='h-4 w-full' />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-10 text-center text-muted-foreground'>
                      No shipments found on the current page.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow
                      key={row.shipment.trackingCode}
                      className='cursor-pointer hover:bg-muted/50'
                      onClick={() => void selectRow(row)}
                    >
                      <TableCell className='font-mono text-xs font-medium'>{row.shipment.trackingCode}</TableCell>
                      <TableCell>
                        <div className='font-mono text-sm'>{row.order.orderNumber}</div>
                        <div className='text-xs text-muted-foreground'>{row.order.shippingMethod || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-48 truncate font-medium'>{customerLabel(row.order)}</div>
                        <div className='max-w-48 truncate text-xs text-muted-foreground'>{row.order.guestPhone || row.order.customerId || 'guest'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[row.shipment.status]}>
                          {STATUS_LABELS[row.shipment.status] ?? row.shipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='max-w-56 truncate text-sm text-muted-foreground'>
                        {row.shipment.currentLocation?.address || '-'}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{formatDate(row.order.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={(event) => {
                            event.stopPropagation()
                            void selectRow(row)
                          }}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalShipmentPages > 1 && (
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Shipment page {page + 1} / {totalShipmentPages}
              </span>
              <div className='flex gap-1'>
                <Button variant='outline' size='icon' disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='icon' disabled={page >= totalShipmentPages - 1} onClick={() => setPage((value) => value + 1)}>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className='space-y-3'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Quick lookup</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Label className='text-xs'>Tracking code</Label>
              <div className='flex gap-2'>
                <Input
                  placeholder='TRK-...'
                  value={manualLookup}
                  onChange={(event) => setManualLookup(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && lookupTracking()}
                />
                <Button onClick={lookupTracking} disabled={loading}>
                  <Search className='mr-1 h-4 w-4' />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {selected ? (
            <TrackingDetail row={selected} onCancel={handleCancel} />
          ) : (
            <div className='rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground'>
              Select a shipment to review tracking details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
