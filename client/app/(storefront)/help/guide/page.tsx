'use client';

import { ShoppingBag, MousePointer2, CreditCard, CheckCircle } from 'lucide-react';

export default function GuidePage() {
  const steps = [
    {
      icon: <MousePointer2 className="h-6 w-6" />,
      title: 'Bước 1: Chọn sản phẩm',
      desc: 'Tìm kiếm hoặc duyệt qua danh mục để chọn sản phẩm ưng ý. Bạn có thể xem kỹ thông số kỹ thuật và đánh giá.'
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: 'Bước 2: Thêm vào giỏ',
      desc: 'Nhấn "Mua ngay" hoặc "Thêm vào giỏ hàng". Bạn có thể tiếp tục mua sắm hoặc tiến hành thanh toán.'
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: 'Bước 3: Thanh toán',
      desc: 'Nhập thông tin giao hàng và chọn phương thức thanh toán phù hợp (MoMo, Chuyển khoản, COD).'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Bước 4: Hoàn tất',
      desc: 'Hệ thống sẽ gửi mã đơn hàng về Email/SMS. Nhân viên NexaTech sẽ liên hệ xác nhận trong ít phút.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      <section className="bg-primary pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Hướng dẫn mua hàng</h1>
          <p className="text-white/70 text-lg">Sở hữu siêu phẩm công nghệ chỉ với vài bước đơn giản</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="space-y-2 pt-2">
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
            <h3 className="text-lg font-bold text-primary mb-4 text-center">Một số lưu ý khi mua hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Vui lòng nhập đúng số điện thoại để nhận OTP.',
                'Kiểm tra kỹ thông số kỹ thuật Laptop/PC trước khi mua.',
                'Sử dụng Mã giảm giá (nếu có) tại trang thanh toán.',
                'Giữ lại hóa đơn điện tử để được hỗ trợ bảo hành.'
              ].map((note, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
