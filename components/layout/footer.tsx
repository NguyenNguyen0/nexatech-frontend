'use client';

export function Footer() {
  return (
    <footer className="w-full bg-white pt-10 pb-6 border-t mt-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-sm">
          <div>
            <h4 className="font-bold text-gray-800 mb-4 tracking-tight">Về chúng tôi</h4>
            <ul className="space-y-2.5 text-black">
              <li><a href="#" className="hover:text-primary">Giới thiệu công ty</a></li>
              <li><a href="#" className="hover:text-primary">Khách hàng Doanh nghiệp (B2B)</a></li>
              <li><a href="#" className="hover:text-primary text-[#cb1c22]">Ưu đãi dành cho giáo dục</a></li>
              <li><a href="#" className="hover:text-primary">Danh sách cửa hàng</a></li>
              <li><a href="#" className="hover:text-primary">Tuyển dụng mới nhất</a></li>
              <li><a href="#" className="hover:text-primary">Hướng dẫn mua hàng Online</a></li>
              <li><a href="#" className="hover:text-primary">Hướng dẫn mua hàng trả góp</a></li>
              <li><a href="#" className="hover:text-primary">Hướng dẫn thanh toán VNPAY</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-4 tracking-tight">Chính sách</h4>
            <ul className="space-y-2.5 text-black">
              <li><a href="#" className="hover:text-primary">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-primary">Chính sách bán hàng</a></li>
              <li><a href="#" className="hover:text-primary">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary">Chính sách kiểm hàng</a></li>
              <li><a href="#" className="hover:text-primary">Trung tâm bảo hành Apple tại Việt Nam</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-4 tracking-tight">Tổng đài hỗ trợ (Miễn phí)</h4>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">Mua ngay:</span>
                <div className="text-right">
                  <span className="text-[#cb1c22] font-bold text-base">1800.6018</span>
                  <span className="text-xs text-gray-500 block">07:30 - 21:30</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium pr-2">Bảo hành:</span>
                <div className="text-right">
                  <span className="text-[#cb1c22] font-bold text-base">1800.6729</span>
                  <span className="text-xs text-gray-500 block">08:00 - 21:00</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">Góp ý:</span>
                <div className="text-right">
                  <span className="text-[#cb1c22] font-bold text-base">1800.6306</span>
                  <span className="text-xs text-gray-500 block">08:30 - 21:30</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-3 tracking-tight">Kết nối với NexaTech</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/nexatech.png"
              alt="NexaTech"
              className="h-8 w-auto object-contain mb-4"
            />
            <div className="flex gap-2 mb-6">
              <span className="w-8 h-8 rounded-full bg-[#0068ff] text-white flex items-center justify-center text-xs font-bold font-serif italic">Zalo</span>
              <span className="w-8 h-8 rounded-full bg-[#1877f2] text-white flex items-center justify-center font-bold font-serif text-lg">f</span>
              <span className="w-8 h-8 rounded-full bg-[#ff0000] text-white flex items-center justify-center">▶</span>
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold italic">d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-[#f5f5f5] w-full pt-6 pb-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-[10px] text-gray-500 leading-relaxed max-w-4xl space-y-1">
            <p>Công Ty Cổ Phần Công Nghệ Nexatech - 77 Trần Quang Khải, P. Tân Định, TP. Hồ Chí Minh.</p>
            <p>SĐT: 0312192244 - Email: lienhe@nexatech.vn - Bản quyền thuộc về Nexatech.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
