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
  RotateCcw,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  adminGetAllPayments,
  adminRefundPayment,
  type PaymentResponse,
  type PaymentStatus,
} from '@/services/paymentApi';

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  COMPLETED:  'bg-green-100 text-green-800',
  FAILED:     'bg-red-100 text-red-800',
  REFUNDED:   'bg-gray-100 text-gray-700',
};

const ALL_STATUSES: PaymentStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'];

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

// ── PaymentDetailDialog ────────────────────────────────────────────────────────

function PaymentDetailDialog({
  payment,
  onClose,
  onRefund,
}: {
  payment: PaymentResponse | null;
  onClose: () => void;
  onRefund: (id: string) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [refunding, setRefunding] = useState(false);

  if (!payment) return null;

  const handleRefund = async () => {
    setRefunding(true);
    try {
      await onRefund(payment.id);
      toast({ title: 'Hoàn tiền thành công', description: `Giao dịch ${payment.id.slice(0, 8)}...` });
      setConfirmRefund(false);
      onClose();
    } catch (e: unknown) {
      toast({ title: 'Lỗi hoàn tiền', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setRefunding(false);
    }
  };

  return (
    <>
      <Dialog open={!!payment} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={STATUS_COLORS[payment.status]}>{payment.status}</Badge>
              <span className="text-muted-foreground">{fmtDate(payment.createdAt)}</span>
            </div>

            <Card>
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm">Thông tin</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">ID giao dịch</p>
                  <p className="font-mono text-xs break-all">{payment.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Đơn hàng</p>
                  <p className="font-mono text-xs break-all">{payment.orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Khách hàng</p>
                  <p className="font-mono text-xs break-all">{payment.customerId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phương thức</p>
                  <p>{payment.method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Số tiền</p>
                  <p className="font-bold">{fmt(payment.amount)}</p>
                </div>
                {payment.transactionId && (
                  <div>
                    <p className="text-muted-foreground">Mã transaction</p>
                    <p className="font-mono text-xs">{payment.transactionId}</p>
                  </div>
                )}
                {payment.failureReason && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Lý do thất bại</p>
                    <p className="text-red-600">{payment.failureReason}</p>
                  </div>
                )}
                {payment.completedAt && (
                  <div>
                    <p className="text-muted-foreground">Hoàn thành lúc</p>
                    <p>{fmtDate(payment.completedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              {payment.status === 'COMPLETED' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmRefund(true)}
                >
                  <RotateCcw size={14} className="mr-1" />
                  Hoàn tiền
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/admin/audit?paymentId=${payment.id}`)}
              >
                <ClipboardList size={14} className="mr-1" />
                Xem audit log
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmRefund} onOpenChange={setConfirmRefund}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hoàn tiền?</AlertDialogTitle>
            <AlertDialogDescription>
              Hoàn tiền {fmt(payment.amount)} cho khách hàng. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund} disabled={refunding}>
              {refunding ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function PaymentManagement() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
  const PAGE_SIZE = 15;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      };
      const result = await adminGetAllPayments(params);
      setPayments(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (e: unknown) {
      toast({
        title: 'Lỗi tải danh sách thanh toán',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const handleRefund = async (paymentId: string) => {
    const updated = await adminRefundPayment(paymentId);
    setPayments(prev => prev.map(p => (p.id === paymentId ? updated : p)));
    if (selectedPayment?.id === paymentId) setSelectedPayment(updated);
  };

  const filtered = search.trim()
    ? payments.filter(
        p =>
          p.id.toLowerCase().includes(search.toLowerCase()) ||
          p.orderId.toLowerCase().includes(search.toLowerCase()) ||
          p.customerId.toLowerCase().includes(search.toLowerCase()),
      )
    : payments;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Quản lý thanh toán</h2>
          <p className="text-sm text-muted-foreground">{totalElements} giao dịch</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin mr-1' : 'mr-1'} />
          Làm mới
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as PaymentStatus | 'ALL')}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="ALL">Tất cả</TabsTrigger>
          {ALL_STATUSES.map(s => (
            <TabsTrigger key={s} value={s}>{s}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Tìm ID, đơn hàng, khách hàng..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID giao dịch</TableHead>
              <TableHead>Đơn hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead>Ngày tạo</TableHead>
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
                  Không có giao dịch nào
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(payment => (
                <TableRow
                  key={payment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <TableCell className="font-mono text-xs">{payment.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {payment.orderId.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[payment.status]}>{payment.status}</Badge>
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(payment.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(payment.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedPayment(payment); }}>
                          <Eye size={14} className="mr-2" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            window.location.href = `/admin/audit?paymentId=${payment.id}`;
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

      <PaymentDetailDialog
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onRefund={handleRefund}
      />
    </div>
  );
}
