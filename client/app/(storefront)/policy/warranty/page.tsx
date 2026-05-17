'use client';

import { ShieldCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      <section className="bg-primary pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Chính sách bảo hành</h1>
          <p className="text-white/70 text-lg">Cam kết đồng hành và bảo vệ quyền lợi khách hàng trọn đời</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 space-y-12">
          {/* Main Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <ShieldCheck className="h-10 w-10 text-primary mx-auto" />
              <h3 className="font-bold">100% Chính hãng</h3>
              <p className="text-sm text-gray-500">Bảo hành theo tiêu chuẩn nhà sản xuất</p>
            </div>
            <div className="text-center space-y-3 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <Clock className="h-10 w-10 text-primary mx-auto" />
              <h3 className="font-bold">Xử lý nhanh</h3>
              <p className="text-sm text-gray-500">Cam kết trả hàng bảo hành trong 7 ngày</p>
            </div>
            <div className="text-center space-y-3 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <MapPin className="h-10 w-10 text-primary mx-auto" />
              <h3 className="font-bold">Tận nhà</h3>
              <p className="text-sm text-gray-500">Hỗ trợ lấy hàng và trả hàng tại nhà</p>
            </div>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary pl-4">1. Thời hạn bảo hành</h2>
              <p className="text-gray-600 leading-relaxed">
                Tất cả sản phẩm mua tại NexaTech đều được hưởng chính sách bảo hành chính hãng. Thời gian bảo hành được tính từ ngày kích hoạt bảo hành điện tử hoặc ngày ghi trên hóa đơn.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Laptop/Gaming PC: 12 - 24 tháng (tùy dòng máy).</li>
                <li>Linh kiện rời (CPU, VGA, Mainboard): 36 tháng.</li>
                <li>Phụ kiện (Chuột, Phím, Tai nghe): 12 - 24 tháng.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary pl-4">2. Điều kiện bảo hành</h2>
              <p className="text-gray-600 leading-relaxed">
                Sản phẩm được bảo hành miễn phí nếu hội đủ các điều kiện sau:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Sản phẩm còn trong thời hạn bảo hành.',
                  'Tem bảo hành còn nguyên vẹn, không rách rời.',
                  'Lỗi kỹ thuật do nhà sản xuất.',
                  'Sản phẩm không có dấu hiệu va đập, thấm nước.'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
