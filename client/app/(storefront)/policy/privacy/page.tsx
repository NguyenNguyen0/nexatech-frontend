'use client';

import { Shield, EyeOff, Lock, UserCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      <section className="bg-primary pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Chính sách bảo mật</h1>
          <p className="text-white/70 text-lg">Bảo vệ quyền riêng tư và dữ liệu cá nhân là ưu tiên hàng đầu của chúng tôi</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="flex gap-4 p-6 rounded-2xl bg-gray-50">
              <Lock className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Mã hóa dữ liệu</h3>
                <p className="text-sm text-gray-500">Sử dụng chuẩn SSL 256-bit bảo mật giao dịch.</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-2xl bg-gray-50">
              <EyeOff className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Không bán dữ liệu</h3>
                <p className="text-sm text-gray-500">Cam kết không chia sẻ thông tin cho bên thứ ba.</p>
              </div>
            </div>
          </div>

          <article className="prose prose-blue max-w-none text-gray-600">
            <h2 className="text-2xl font-bold text-gray-900">1. Thu thập thông tin</h2>
            <p>
              NexaTech thu thập thông tin của bạn khi bạn đăng ký tài khoản, đặt hàng hoặc đăng ký nhận bản tin. Các thông tin bao gồm: Họ tên, email, số điện thoại, địa chỉ giao hàng và lịch sử mua hàng.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">2. Mục đích sử dụng</h2>
            <p>
              Chúng tôi sử dụng thông tin thu thập được để:
            </p>
            <ul>
              <li>Xử lý đơn hàng và cung cấp dịch vụ khách hàng.</li>
              <li>Gửi thông báo về tình trạng đơn hàng.</li>
              <li>Cá nhân hóa trải nghiệm mua sắm của bạn.</li>
              <li>Cải thiện chất lượng website và dịch vụ hậu mãi.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">3. Quyền hạn của bạn</h2>
            <p>
              Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất kỳ lúc nào thông qua phần quản lý tài khoản. NexaTech cam kết hỗ trợ tối đa các yêu cầu liên quan đến quyền riêng tư của khách hàng.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">4. Liên hệ bảo mật</h2>
            <p>
              Nếu có bất kỳ thắc mắc nào về chính sách bảo mật, vui lòng liên hệ bộ phận an ninh mạng của chúng tôi tại: <strong>privacy@nexatech.com</strong>
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
