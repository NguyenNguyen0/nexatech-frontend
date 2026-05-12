import { ShieldCheck, Truck, Headphones, RefreshCcw } from 'lucide-react';

const trustPoints = [
  {
    title: 'Bảo hành chính hãng',
    description: '12-24 tháng bảo hành tại hãng trên toàn quốc',
    icon: ShieldCheck,
  },
  {
    title: 'Miễn phí giao hàng',
    description: 'Đơn từ 500.000₫, giao hàng nhanh 2-4 giờ nội thành',
    icon: Truck,
  },
  {
    title: 'Đổi trả 30 ngày',
    description: 'Đổi trả miễn phí nếu sản phẩm lỗi do nhà sản xuất',
    icon: RefreshCcw,
  },
  {
    title: 'Tư vấn 24/7',
    description: 'Hotline 1900.xxxx hỗ trợ kỹ thuật mọi lúc',
    icon: Headphones,
  },
];

export function TrustStrip() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trustPoints.map((point) => {
          const Icon = point.icon;
          return (
            <div
              key={point.title}
              className="flex items-start gap-3 rounded-md border border-[#e8e8e8] bg-white p-4"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-[#eef5fa]">
                <Icon className="h-[18px] w-[18px] text-[#004d75]" />
              </div>
              <div>
                <h3 className="text-[12px] font-bold text-[#1b1c1c]">{point.title}</h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#888]">
                  {point.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
