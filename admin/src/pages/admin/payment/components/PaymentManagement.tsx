import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Eye,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  Search,
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
import { toast } from '@/components/ui/use-toast'
import { adminGetAllOrders, type OrderResponse } from '@/services/orderApi'
import {
  adminRefundPayment,
  getOptionalPaymentByOrderId,
  type PaymentResponse,
  type PaymentStatus,
} from '@/services/paymentApi'

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
}

const ALL_STATUSES: PaymentStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']
const PAGE_SIZE = 15

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value ?? 0)

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

const customerLabel = (order?: OrderResponse) =>
  order?.guestName || order?.guestEmail || order?.guestPhone || order?.customerId || 'Guest customer'

type PaymentRow = {
  payment: PaymentResponse
  order: OrderResponse
}

function PaymentDetailDialog({
  row,
  onClose,
  onRefund,
}: {
  row: PaymentRow | null
  onClose: () => void
  onRefund: (id: string) => Promise<void>
}) {
  const navigate = useNavigate()
  const [confirmRefund, setConfirmRefund] = useState(false)
  const [refunding, setRefunding] = useState(false)

  if (!row) return null

  const { payment, order } = row

  const handleRefund = async () => {
    setRefunding(true)
    try {
      await onRefund(payment.id)
      toast({
        title: 'Refund completed',
        description: `Payment ${payment.id.slice(0, 8)}... has been refunded.`,
      })
      setConfirmRefund(false)
      onClose()
    } catch (error: unknown) {
      toast({
        title: 'Refund failed',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setRefunding(false)
    }
  }

  return (
    <>
      <Dialog open={Boolean(row)} onOpenChange={onClose}>
        <DialogContent className='max-h-[90vh] w-[92vw] overflow-y-auto sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle className='flex flex-wrap items-center gap-2'>
              Payment details
              <Badge className={STATUS_COLORS[payment.status]}>{payment.status}</Badge>
            </DialogTitle>
            <DialogDescription>
              Review transaction details, customer context, refund actions, and trace log access.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 text-sm'>
            <Card>
              <CardHeader className='px-4 py-3'>
                <CardTitle className='flex items-center gap-2 text-sm'>
                  <CreditCard className='h-4 w-4' />
                  Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3 px-4 pb-4 md:grid-cols-2'>
                <div>
                  <p className='text-muted-foreground'>Payment ID</p>
                  <p className='break-all font-mono text-xs'>{payment.id}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Order</p>
                  <p className='font-mono text-xs'>{order.orderNumber}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Customer</p>
                  <p>{customerLabel(order)}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Method</p>
                  <p>{payment.method}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Amount</p>
                  <p className='font-semibold'>{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Created at</p>
                  <p>{formatDate(payment.createdAt)}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Completed at</p>
                  <p>{formatDate(payment.completedAt)}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Transaction ID</p>
                  <p className='break-all font-mono text-xs'>{payment.transactionId || '-'}</p>
                </div>
                {payment.failureReason && (
                  <div className='md:col-span-2'>
                    <p className='text-muted-foreground'>Failure reason</p>
                    <p className='text-red-600'>{payment.failureReason}</p>
                  </div>
                )}
                <div className='md:col-span-2'>
                  <p className='text-muted-foreground'>Shipping address</p>
                  <p>{order.shippingAddress || '-'}</p>
                </div>
              </CardContent>
            </Card>

            <div className='flex flex-wrap gap-2'>
              {payment.status === 'COMPLETED' && (
                <Button size='sm' variant='destructive' onClick={() => setConfirmRefund(true)}>
                  <RotateCcw className='mr-1 h-4 w-4' />
                  Refund
                </Button>
              )}
              <Button size='sm' variant='outline' onClick={() => navigate(`/admin/audit/trace?paymentId=${payment.id}`)}>
                <ClipboardList className='mr-1 h-4 w-4' />
                Trace log
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmRefund} onOpenChange={setConfirmRefund}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm refund?</AlertDialogTitle>
            <AlertDialogDescription>
              Refund {formatCurrency(payment.amount)} for this customer. This action cannot be undone from the admin UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund} disabled={refunding}>
              {refunding ? 'Processing...' : 'Confirm refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function PaymentManagement() {
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalOrderPages, setTotalOrderPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [selectedRow, setSelectedRow] = useState<PaymentRow | null>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const orderPage = await adminGetAllOrders({
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
      })

      setTotalOrderPages(orderPage.totalPages)

      const entries = await Promise.allSettled(
        orderPage.content.map(async (order) => {
          const payment = await getOptionalPaymentByOrderId(order.id).catch(() => null)
          return payment ? ({ payment, order } satisfies PaymentRow) : null
        }),
      )

      setRows(
        entries
          .map((entry) => (entry.status === 'fulfilled' ? entry.value : null))
          .filter((entry): entry is PaymentRow => Boolean(entry)),
      )
    } catch (error: unknown) {
      toast({
        title: 'Unable to load payments',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  useEffect(() => {
    setPage(0)
  }, [statusFilter])

  const handleRefund = async (paymentId: string) => {
    const updated = await adminRefundPayment(paymentId)
    setRows((prev) =>
      prev.map((row) => (row.payment.id === paymentId ? { ...row, payment: updated } : row)),
    )
    if (selectedRow?.payment.id === paymentId) {
      setSelectedRow({ ...selectedRow, payment: updated })
    }
  }

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return rows.filter(({ payment, order }) => {
      if (statusFilter !== 'ALL' && payment.status !== statusFilter) return false
      if (!keyword) return true
      return [
        payment.id,
        payment.orderId,
        payment.customerId,
        payment.transactionId,
        order.orderNumber,
        order.guestName,
        order.guestEmail,
        order.guestPhone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
  }, [rows, search, statusFilter])

  const completedCount = rows.filter((row) => row.payment.status === 'COMPLETED').length
  const pageAmount = rows.reduce((sum, row) => sum + Number(row.payment.amount || 0), 0)

  return (
    <div className='space-y-4 p-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold'>Payment Management</h2>
          <p className='text-sm text-muted-foreground'>
            Payments are resolved from orders via /api/v1/payments/order/:orderId.
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs font-medium text-muted-foreground'>Payments on this order page</p>
            <p className='mt-1 text-xl font-semibold'>{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs font-medium text-muted-foreground'>Completed</p>
            <p className='mt-1 text-xl font-semibold'>{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs font-medium text-muted-foreground'>Amount on page</p>
            <p className='mt-1 text-xl font-semibold'>{formatCurrency(pageAmount)}</p>
          </CardContent>
        </Card>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'ALL')}>
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
            placeholder='Search payment, order, customer...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className='text-right'>Amount</TableHead>
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
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='py-10 text-center text-muted-foreground'>
                  No payments found on the current order page.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow
                  key={row.payment.id}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => setSelectedRow(row)}
                >
                  <TableCell className='font-mono text-xs'>{row.payment.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div className='font-mono text-xs font-medium'>{row.order.orderNumber}</div>
                    <div className='text-xs text-muted-foreground'>{row.payment.orderId.slice(0, 8)}...</div>
                  </TableCell>
                  <TableCell>
                    <div className='max-w-52 truncate font-medium'>{customerLabel(row.order)}</div>
                    <div className='max-w-52 truncate text-xs text-muted-foreground'>{row.order.guestPhone || row.payment.customerId || 'guest'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[row.payment.status]}>{row.payment.status}</Badge>
                  </TableCell>
                  <TableCell>{row.payment.method}</TableCell>
                  <TableCell className='text-right font-medium'>{formatCurrency(row.payment.amount)}</TableCell>
                  <TableCell className='text-muted-foreground'>{formatDate(row.payment.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={(event) => { event.stopPropagation(); setSelectedRow(row) }}>
                          <Eye className='mr-2 h-4 w-4' />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(event) => { event.stopPropagation(); window.location.href = `/admin/audit/trace?paymentId=${row.payment.id}` }}>
                          <ClipboardList className='mr-2 h-4 w-4' />
                          Trace log
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalOrderPages > 1 && (
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>
            Order page {page + 1} / {totalOrderPages}
          </span>
          <div className='flex gap-1'>
            <Button variant='outline' size='icon' disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='icon' disabled={page >= totalOrderPages - 1} onClick={() => setPage((value) => value + 1)}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      <PaymentDetailDialog
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onRefund={handleRefund}
      />
    </div>
  )
}
