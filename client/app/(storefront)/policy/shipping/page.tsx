'use client';

import { Truck, Zap, ShieldCheck } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      <section className="bg-primary pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Chính sách vận chuyển</h1>
          <p className="text-white/70 text-lg">Giao hàng nhanh chóng - Đóng gói cẩn thận - Bảo hiểm 100%</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
          {/* Shipping Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 space-y-6 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Giao hàng Hỏa Tốc</h3>
                  <p className="text-sm text-gray-500">NexaExpress 2H</p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li className="flex gap-2">✓ Áp dụng nội thành Hà Nội & TP. HCM.</li>
                <li className="flex gap-2">✓ Thời gian nhận hàng: Dưới 2 giờ.</li>
                <li className="flex gap-2">✓ Miễn phí cho đơn hàng từ 5.000.000đ.</li>
              </ul>
            </div>
            
            <div className="p-8 md:p-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Giao hàng Tiêu Chuẩn</h3>
                  <p className="text-sm text-gray-500">Toàn quốc</p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li className="flex gap-2">✓ Thời gian: 1-3 ngày làm việc.</li>
                <li className="flex gap-2">✓ Miễn phí cho đơn hàng từ 1.000.000đ.</li>
                <li className="flex gap-2">✓ Đối tác: VNPost, GHTK, Viettel Post.</li>
              </ul>
            </div>
          </div>

          <div className="p-8 md:p-12 bg-gray-50 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Quy định về đồng kiểm</h2>
              <p className="text-gray-600 leading-relaxed">
                NexaTech cho phép khách hàng kiểm tra sản phẩm trước khi thanh toán. Bạn có quyền mở hộp để kiểm tra ngoại quan (màu sắc, trầy xước, phụ kiện) nhưng không được dùng thử hoặc cắm điện (với một số dòng máy đặc thù).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Bảo hiểm hàng hóa</h2>
              <p className="text-gray-600 leading-relaxed">
                Tất cả đơn hàng của NexaTech đều được đóng gói chống sốc 3 lớp và mua bảo hiểm 100% giá trị. Nếu xảy ra thất lạc hoặc hư hỏng trong quá trình vận chuyển, chúng tôi cam kết gửi bù sản phẩm mới ngay lập tức.
              </p>
            </section>

            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-white border border-gray-100">
              <div className="flex items-center gap-3 shrink-0">
                <ShieldCheck className="h-8 w-8 text-success" />
                <span className="font-bold">An tâm tuyệt đối</span>
              </div>
              <p className="text-sm text-gray-500">
                Quá trình đóng gói tại kho luôn được quay camera 24/7 để đối soát nếu có khiếu nại.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
