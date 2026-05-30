'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

/* ── Footer data matching Stitch design exactly ── */

const supportLinks = [
  { label: 'Trung tâm trợ giúp', href: '/help' },
  { label: 'Hướng dẫn mua hàng', href: '/help/guide' },
  { label: 'Tra cứu đơn hàng', href: '/order' },
  { label: 'Liên hệ', href: '/help/contact' },
  { label: 'Câu hỏi thường gặp', href: '/help/faq' },
];

const policyLinks = [
  { label: 'Chính sách bảo hành', href: '/policy/warranty' },
  { label: 'Chính sách đổi trả', href: '/policy/returns' },
  { label: 'Chính sách vận chuyển', href: '/policy/shipping' },
  { label: 'Chính sách bảo mật', href: '/policy/privacy' },
];

const paymentMethods = [
  { name: 'COD', bg: 'bg-green-500' },
  { name: 'VNPay', bg: 'bg-blue-500' },
];

const socialLinks = [
  { name: 'Facebook', image: '/footer/facebook.png', href: 'https://www.facebook.com/nextech.official' },
  { name: 'Instagram', image: '/footer/instagram.png', href: 'https://www.instagram.com/nextech.official' },
  { name: 'Youtube', image: '/footer/youtube.png', href: 'https://www.youtube.com/@nextech.official' },
];

export function Footer() {
  return (
    <>
      {/* Main Footer - dark blue background matching Stitch design */}
      <footer className="border-t border-[#001524] bg-[#001e31]">
        <div className="mx-auto max-w-[1200px] px-4 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Hỗ trợ */}
            <div>
              <h3 className="mb-4 text-[14px] font-bold text-white">Hỗ trợ</h3>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#bfe0ff] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chính sách */}
            <div>
              <h3 className="mb-4 text-[14px] font-bold text-white">Chính sách</h3>
              <ul className="space-y-2.5">
                {policyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#bfe0ff] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <h3 className="mb-4 text-[14px] font-bold text-white">
                Phương thức thanh toán
              </h3>
              <div className="flex items-center gap-2.5">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className={`flex h-8 w-12 items-center justify-center rounded ${method.bg} text-[10px] font-bold text-white`}
                  >
                    {method.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Social media */}
            <div>
              <h3 className="mb-4 text-[14px] font-bold text-white">Social media</h3>
              <div className="space-y-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-[13px] text-[#bfe0ff] transition hover:text-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={social.image}
                      alt={social.name}
                      className="h-6 w-6 object-contain"
                    />
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-[#002a45]">
          <div className="mx-auto max-w-[1200px] px-4 py-4">
            <p className="text-[12px] text-[#90cdff]">
              Bản quyền thuộc về NexaTech
            </p>
          </div>
        </div>
      </footer>

      {/* Chat FAB - lighter blue circle for contrast */}
      <button
        type="button"
        onClick={() => {}}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#006699] text-white shadow-lg transition hover:scale-105 hover:bg-[#004d75]"
        aria-label="Chat hỗ trợ"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </>
  );
}
