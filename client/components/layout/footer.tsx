'use client';

import { Mail, MapPin, Phone as PhoneIcon } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-elevated dark:bg-bg-elevated border-t border-border dark:border-border/50 mt-12 transition-smooth">
      {/* Main Footer */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-lg p-2">
                <span className="text-white font-display font-bold">NT</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-text-primary dark:text-text-inverse">NexaTech</h3>
                <p className="text-xs text-text-tertiary">Tech Retail Platform</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary dark:text-text-tertiary leading-relaxed">
              Nền tảng thương mại điện tử hàng đầu Việt Nam, cung cấp các sản phẩm công nghệ chính hãng với giá tốt nhất.
            </p>
            <div className="flex gap-2">
              {['f', 'In', '𝕏', 'Y'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/5 text-primary hover:bg-primary hover:text-white dark:hover:text-white transition-smooth flex items-center justify-center font-bold"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display font-bold text-text-primary dark:text-text-inverse mb-4">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2">
              {[
                'Giới thiệu công ty',
                'Chính sách bảo hành',
                'Chính sách bảo mật',
                'Hướng dẫn mua hàng',
                'Hướng dẫn thanh toán',
                'Trung tâm trợ giúp',
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-text-secondary dark:text-text-tertiary hover:text-primary dark:hover:text-primary transition-smooth"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display font-bold text-text-primary dark:text-text-inverse mb-4">
              Danh Mục Sản Phẩm
            </h4>
            <ul className="space-y-2">
              {['Điện thoại', 'Tablet & Laptop', 'Phụ kiện', 'Gia dụng', 'Khuyến mãi', 'Outlet'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-text-secondary dark:text-text-tertiary hover:text-primary dark:hover:text-primary transition-smooth"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-text-primary dark:text-text-inverse mb-4">
              Liên Hệ Chúng Tôi
            </h4>
            <div className="space-y-3">
              <a href="tel:1800.6018" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth">
                <PhoneIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-tertiary">Gọi mua hàng</p>
                  <p className="font-bold text-primary">1800.6018</p>
                </div>
              </a>
              <a href="mailto:support@nexatech.vn" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-tertiary">Email</p>
                  <p className="font-bold text-text-primary dark:text-text-inverse text-sm">support@nexatech.vn</p>
                </div>
              </a>
              <a href="#" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-tertiary">Văn phòng</p>
                  <p className="font-bold text-text-primary dark:text-text-inverse text-sm">77 Trần Quang Khải, TP.HCM</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border dark:border-border/50 my-8" />

        {/* Bottom Footer */}
        <div className="space-y-4">
          {/* Links */}
          <div className="flex flex-wrap gap-4 justify-center text-sm text-text-tertiary">
            <a href="#" className="hover:text-primary transition-smooth">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-smooth">Chính sách bảo mật</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-smooth">Khiếu nại, tố cáo</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-smooth">Sitemap</a>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-text-tertiary space-y-1">
            <p>
              © {currentYear} NexaTech. Tất cả quyền được bảo lưu. Công ty Cổ Phần Công Nghệ NexaTech
            </p>
            <p>
              Mã số doanh nghiệp: 0123456789 | Địa chỉ: 77 Trần Quang Khải, Phường Tân Định, TP.HCM
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-10 h-10 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-smooth flex items-center justify-center z-40 hidden lg:flex"
      >
        ↑
      </button>
    </footer>
  );
}
