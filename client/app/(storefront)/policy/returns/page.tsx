'use client';

import { RefreshCw, PackageCheck, Banknote, HelpCircle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      <section className="bg-primary pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Chính sách đổi trả</h1>
          <p className="text-white/70 text-lg">Hỗ trợ nhanh chóng - Thủ tục đơn giản - An tâm mua sắm</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12">
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold">15 Ngày Đổi Mới</h3>
                <p className="text-xs text-gray-500">Lỗi 1 đổi 1 ngay lập tức trong 15 ngày đầu.</p>
              </div>
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <PackageCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold">Kiểm Tra Tại Nhà</h3>
                <p className="text-xs text-gray-500">Hỗ trợ nhân viên đến lấy hàng tận nơi để kiểm định.</p>
              </div>
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Banknote className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold">Hoàn Tiền 100%</h3>
                <p className="text-xs text-gray-500">Hoàn tiền nhanh chóng nếu không có hàng thay thế.</p>
              </div>
            </div>

            <article className="prose prose-blue max-w-none text-gray-600">
              <h2 className="text-2xl font-bold text-gray-900">1. Trường hợp được đổi trả</h2>
              <ul>
                <li>Sản phẩm bị lỗi kỹ thuật do nhà sản xuất (hỏng hóc, lỗi phần cứng, chết điểm ảnh...).</li>
                <li>Sản phẩm bị hư hỏng do quá trình vận chuyển của NexaTech.</li>
                <li>Sản phẩm giao không đúng mẫu mã, màu sắc hoặc thông số kỹ thuật đã đặt.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8">2. Yêu cầu sản phẩm khi đổi trả</h2>
              <ul>
                <li>Sản phẩm còn đầy đủ hộp, sách hướng dẫn, phụ kiện đi kèm.</li>
                <li>Còn nguyên tem bảo hành, không có dấu hiệu tháo dỡ linh kiện.</li>
                <li>Quà tặng kèm theo (nếu có) phải được trả lại cùng sản phẩm chính.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8">3. Quy trình thực hiện</h2>
              <p>
                Bước 1: Liên hệ hotline 1900-XXXX hoặc mục Chat để thông báo lỗi.<br />
                Bước 2: Chụp ảnh/Quay video tình trạng sản phẩm.<br />
                Bước 3: NexaTech cử nhân viên đến xác nhận và thu hồi hàng hoặc khách hàng gửi qua bưu điện.<br />
                Bước 4: Thực hiện đổi mới hoặc hoàn tiền trong vòng 3-5 ngày làm việc.
              </p>
            </article>

            <div className="p-6 bg-warning/5 border border-warning/20 rounded-2xl flex gap-4">
              <HelpCircle className="h-6 w-6 text-warning shrink-0" />
              <p className="text-sm text-gray-700 italic">
                Lưu ý: NexaTech không áp dụng đổi trả với trường hợp khách hàng thay đổi ý định mua hàng (&ldquo;Đổi ý&rdquo;) sau khi đã bóc tem niêm phong sản phẩm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
