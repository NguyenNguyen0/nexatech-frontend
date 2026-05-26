/**
 * EnhancedOrderManagement — connects to real order-service API.
 * Replaces the previous mock-data implementation.
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  ClipboardList,
  MoreVertical,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/custom/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  type OrderResponse,
  type OrderStatus,
} from '@/services/orderApi';

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED:    'bg-cyan-100 text-cyan-800',
  DELIVERED:  'bg-green-100 text-green-800',
  COMPLETED:  'bg-emerald-100 text-emerald-800',
  CANCELLED:  'bg-red-100 text-red-800',
  RETURNED:   'bg-orange-100 text-orange-800',
  REFUNDED:   'bg-gray-100 text-gray-700',
};

const ALL_STATUSES: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED',
  'COMPLETED', 'CANCELLED', 'RETURNED', 'REFUNDED',
];

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

// ── sub-components ────────────────────────────────────────────────────────────

function OrderDetailDialog({
  order,
  onClose,
  onStatusChange,
}: {
  order: OrderResponse | null;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    if (order) setNewStatus('');
  }, [order]);

  if (!order) return null;

  const handleUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await onStatusChange(order.id, newStatus as OrderStatus);
      toast({ title: 'Cap nhat thanh cong', description: `Don hang ${order.orderNumber} -> ${newStatus}` });
      onClose();
    } catch (e: unknown) {
      toast({ title: 'Loi', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiet don hang #{order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
            <span className="text-muted-foreground">{fmtDate(order.createdAt)}</span>
          </div>

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">San pham</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ten</TableHead>
                    <TableHead className="text-right">SL</TableHead>
                    <TableHead className="text-right">Don gia</TableHead>
                    <TableHead className="text-right">Thanh tien</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{fmt(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{fmt(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-2 space-y-1 text-right">
                <div>Phi van chuyen: <strong>{fmt(order.shippingFee)}</strong></div>
                {order.discount > 0 && <div>Giam gia: <strong>-{fmt(order.discount)}</strong></div>}
                <div className="text-base font-bold">Tong: {fmt(order.totalAmount)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Van chuyen</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground">Dia chi</p>
                <p>{order.shippingAddress}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phuong thuc</p>
                <p>{order.shippingMethod}</p>
              </div>
              {order.carrierName && (
                <div>
                  <p className="text-muted-foreground">Hang van chuyen</p>
                  <p>{order.carrierName}</p>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <p className="text-muted-foreground">Ma tracking</p>
                  <p className="font-mono">{order.trackingNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Thanh toan</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p>Phuong thuc: <strong>{order.paymentMethod}</strong></p>
            </CardContent>
          </Card>

          <div className="flex gap-2 items-center">
            <Select value={newStatus} onValueChange={v => setNewStatus(v as OrderStatus)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Doi trang thai..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.filter(s => s !== order.status).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!newStatus || updating}
              onClick={handleUpdate}
            >
              Cap nhat
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/audit?orderId=${order.id}`)}
            >
              <ClipboardList size={14} className="mr-1" />
              Xem audit log
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function EnhancedOrderManagement() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const PAGE_SIZE = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      };
      const result = await adminGetAllOrders(params);
      setOrders(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (e: unknown) {
      toast({
        title: 'Loi tai don hang',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const updated = await adminUpdateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
    if (selectedOrder?.id === orderId) setSelectedOrder(updated);
  };

  const filtered = search.trim()
    ? orders.filter(
        o =>
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.customerId.toLowerCase().includes(search.toLowerCase()),
      )
    : orders;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Quan ly don hang</h2>
          <p className="text-sm text-muted-foreground">{totalElements} don hang</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin mr-1' : 'mr-1'} />
          Lam moi
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as OrderStatus | 'ALL')}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="ALL">Tat ca</TabsTrigger>
          {ALL_STATUSES.map(s => (
            <TabsTrigger key={s} value={s}>{s}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Tim ma don, khach hang..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ma don</TableHead>
              <TableHead>Khach hang</TableHead>
              <TableHead>Trang thai</TableHead>
              <TableHead>Thanh toan</TableHead>
              <TableHead className="text-right">Tong tien</TableHead>
              <TableHead>Ngay tao</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Khong co don hang nao
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(order => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-30">
                    {order.customerId}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(order.totalAmount)}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}>
                          <Eye size={14} className="mr-2" /> Xem chi tiet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            window.location.href = `/admin/audit?orderId=${order.id}`;
                          }}
                        >
                          <ClipboardList size={14} className="mr-2" /> Audit log
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
