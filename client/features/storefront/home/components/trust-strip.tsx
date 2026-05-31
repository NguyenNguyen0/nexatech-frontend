import { ShieldCheck, ArrowUpDown, Truck, Award } from 'lucide-react';

const trustPoints = [
  {
    title: 'Thương hiệu đảm bảo',
    description: 'Nhập khẩu, bảo hành chính hãng',
    icon: ShieldCheck,
  },
  {
    title: 'Đổi trả dễ dàng',
    description: 'Theo chính sách đổi trả tại NexaTech',
    icon: ArrowUpDown,
  },
  {
    title: 'Giao hàng tận nơi',
    description: 'Trên toàn quốc',
    icon: Truck,
  },
  {
    title: 'Sản phẩm chất lượng',
    description: 'Đảm bảo tương thích và độ bền cao',
    icon: Award,
  },
];

export function TrustStrip() {
  return (
    <section className="w-full bg-[#f4f6f8] py-8 border-t border-[#e8e8e8]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-6 px-4 sm:grid-cols-4 md:gap-x-4">
        {trustPoints.map((point) => {
          const Icon = point.icon;
          return (
            <div
              key={point.title}
              className="flex flex-col items-center text-center"
            >
              {/* Circular Icon Container */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-[#e2e8f0] mb-3">
                <Icon className="h-6 w-6 text-[#ef4444]" />
              </div>
              <h3 className="text-[13px] font-bold text-[#1b1c1c]">{point.title}</h3>
              <p className="mt-1 text-[11px] text-[#666] leading-relaxed max-w-[200px]">
                {point.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
