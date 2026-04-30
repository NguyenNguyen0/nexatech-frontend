'use client';

import { Package, Search, Clock, CheckCircle2, Truck as TruckIcon } from 'lucide-react';
import { useState } from 'react';

const mockOrders = [
  { id: 'NXT-2025001', date: '2025-04-28', status: 'delivered', total: 2590000, items: 3 },
  { id: 'NXT-2025002', date: '2025-04-30', status: 'shipping', total: 1290000, items: 1 },
  { id: 'NXT-2025003', date: '2025-04-30', status: 'pending', total: 450000, items: 2 },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Chờ xác nhận', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  shipping: { label: 'Đang giao', color: 'text-blue-600 bg-blue-50', icon: TruckIcon },
  delivered: { label: 'Đã giao', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
};

export default function OrderPage() {
  const [search, setSearch] = useState('');

  const filtered = mockOrders.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8 page-transition">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Package className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
          <p className="text-sm text-muted-foreground">Tra cứu và theo dõi đơn hàng</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn hàng..."
          className="w-full pl-11 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((order) => {
          const sc = statusConfig[order.status];
          const StatusIcon = sc.icon;
          return (
            <div key={order.id} className="card-nexatech p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sc.color}`}>
                  <StatusIcon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.date} · {order.items} sản phẩm</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{order.total.toLocaleString('vi-VN')} ₫</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="size-12 mx-auto mb-3 opacity-30" />
            <p>Không tìm thấy đơn hàng</p>
          </div>
        )}
      </div>
    </div>
  );
}
