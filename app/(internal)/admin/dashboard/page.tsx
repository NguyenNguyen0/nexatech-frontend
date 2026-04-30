export default function AdminDashboardPage() {
  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng doanh thu', value: '₫ 123.456.000', change: '+12.5%' },
          { label: 'Đơn hàng', value: '1,234', change: '+8.2%' },
          { label: 'Khách hàng mới', value: '567', change: '+15.3%' },
          { label: 'Sản phẩm', value: '890', change: '+2.1%' },
        ].map((stat) => (
          <div key={stat.label} className="card-nexatech p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-green-600 mt-1">{stat.change} so với tháng trước</p>
          </div>
        ))}
      </div>
    </div>
  );
}
