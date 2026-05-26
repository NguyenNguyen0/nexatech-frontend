import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, PackageCheck, Truck, XCircle, MapPin, Clock } from 'lucide-react';

import { Button } from '@/components/custom/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

import {
  getShipmentByOrderId,
  getShipmentTracking,
  cancelShipment,
  type TrackingInfo,
  type ShipmentStatus,
} from '@/services/shippingApi';

// ── helpers ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  PENDING_PICKUP: 'bg-yellow-100 text-yellow-800',
  PICKED_UP:      'bg-blue-100 text-blue-800',
  IN_TRANSIT:     'bg-indigo-100 text-indigo-800',
  DELIVERED:      'bg-green-100 text-green-800',
  FAILED:         'bg-red-100 text-red-800',
  RETURNED:       'bg-orange-100 text-orange-800',
  CANCELLED:      'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING_PICKUP: 'Chờ lấy hàng',
  PICKED_UP:      'Đã lấy hàng',
  IN_TRANSIT:     'Đang vận chuyển',
  DELIVERED:      'Đã giao',
  FAILED:         'Giao thất bại',
  RETURNED:       'Đã hoàn hàng',
  CANCELLED:      'Đã huỷ',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'medium' });

// ── TrackingCard ───────────────────────────────────────────────────────────────

function TrackingCard({
  info,
  onCancel,
}: {
  info: TrackingInfo;
  onCancel: () => void;
}) {
  const navigate = useNavigate();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel();
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(info.status);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base font-mono">{info.trackingCode}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đơn vị vận chuyển: <span className="font-medium">{info.provider}</span>
              </p>
            </div>
            <Badge className={STATUS_COLORS[info.status]}>
              {STATUS_LABELS[info.status] ?? info.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* current location */}
          {info.currentLocation && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={14} className="mt-0.5 text-muted-foreground shrink-0" />
              <span>
                {info.currentLocation.address
                  ? info.currentLocation.address
                  : `${info.currentLocation.lat ?? '—'}, ${info.currentLocation.lng ?? '—'}`}
              </span>
            </div>
          )}

          {/* action buttons */}
          <div className="flex gap-2 flex-wrap">
            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmCancel(true)}
              >
                <XCircle size={14} className="mr-1" />
                Huỷ lô hàng
              </Button>
            )}
            {/* link to audit if needed */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/order`)}
            >
              <PackageCheck size={14} className="mr-1" />
              Xem đơn hàng
            </Button>
          </div>

          <Separator />

          {/* history timeline */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
              <Clock size={14} />
              Lịch sử vận chuyển ({info.histories.length} sự kiện)
            </h4>

            {info.histories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có sự kiện nào.</p>
            ) : (
              <ScrollArea className="h-64">
                <div className="relative pl-5">
                  <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-border" />
                  {[...info.histories]
                    .sort(
                      (a, b) =>
                        new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime(),
                    )
                    .map((h, idx) => (
                      <div key={idx} className="relative mb-4">
                        <div className="absolute -left-3.5 mt-1 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                        <div className="rounded-lg border bg-card p-2.5">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className={`text-xs ${STATUS_COLORS[h.status]}`}>
                              {STATUS_LABELS[h.status] ?? h.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {fmtDate(h.eventTime)}
                            </span>
                          </div>
                          {h.locationAddress && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin size={10} />
                              {h.locationAddress}
                            </p>
                          )}
                          {h.note && (
                            <p className="text-xs mt-1">{h.note}</p>
                          )}
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
            <AlertDialogTitle>Xác nhận huỷ lô hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Lô hàng <span className="font-mono">{info.trackingCode}</span> sẽ được yêu cầu huỷ.
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Đang xử lý...' : 'Xác nhận huỷ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export function ShippingManagement() {
  const [mode, setMode] = useState<'order' | 'tracking'>('order');

  const [orderId, setOrderId]         = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  const [info, setInfo]       = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    const query = mode === 'order' ? orderId.trim() : trackingCode.trim();
    if (!query) {
      toast({ title: 'Vui lòng nhập ID để tìm kiếm', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setInfo(null);
    try {
      const result =
        mode === 'order'
          ? await getShipmentByOrderId(query)
          : await getShipmentTracking(query);
      setInfo(result);
    } catch (e: unknown) {
      toast({ title: 'Không tìm thấy lô hàng', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!info) return;
    try {
      const result = await cancelShipment(info.trackingCode);
      toast({ title: 'Đã gửi yêu cầu huỷ', description: result.message });
      // refresh
      setInfo(prev => prev ? { ...prev, status: result.status } : prev);
    } catch (e: unknown) {
      toast({ title: 'Lỗi huỷ lô hàng', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Truck size={20} />
          Quản lý vận chuyển
        </h2>
        <p className="text-sm text-muted-foreground">
          Tra cứu và theo dõi lô hàng theo Order ID hoặc mã vận đơn
        </p>
      </div>

      <Separator />

      {/* search mode tabs */}
      <Tabs value={mode} onValueChange={v => { setMode(v as 'order' | 'tracking'); setInfo(null); }}>
        <TabsList>
          <TabsTrigger value="order">Theo Order ID</TabsTrigger>
          <TabsTrigger value="tracking">Theo mã vận đơn</TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="mt-4">
          <div className="flex gap-2 items-end max-w-lg">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Order ID (UUID)</Label>
              <Input
                placeholder="3f2a1b...UUID..."
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
            </div>
            <Button onClick={search} disabled={loading}>
              {loading
                ? <RefreshCw size={14} className="animate-spin mr-1" />
                : <Search size={14} className="mr-1" />
              }
              Tìm kiếm
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <div className="flex gap-2 items-end max-w-lg">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Mã vận đơn</Label>
              <Input
                placeholder="TRK-20240101-ABCD1234"
                value={trackingCode}
                onChange={e => setTrackingCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
            </div>
            <Button onClick={search} disabled={loading}>
              {loading
                ? <RefreshCw size={14} className="animate-spin mr-1" />
                : <Search size={14} className="mr-1" />
              }
              Tìm kiếm
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* result */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {!loading && info && (
        <TrackingCard info={info} onCancel={handleCancel} />
      )}

      {!loading && !info && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nhập Order ID hoặc mã vận đơn và nhấn Tìm kiếm
        </div>
      )}
    </div>
  );
}
