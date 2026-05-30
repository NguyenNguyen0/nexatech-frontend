'use client';

import Link from 'next/link';

export function ServiceBanners() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-6">
      <h2 className="mb-4 text-lg font-bold text-[#1b1c1c]">
        Dịch vụ hời, càng sắm càng lời
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Banner 1 */}
        <Link
          href="/promotions/secret-gift"
          className="group block overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/service/1.png"
            alt="Kho quà bí mật dành cho người Lười"
            className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        </Link>

        {/* Banner 2 */}
        <Link
          href="/promotions/subsidized-upgrade"
          className="group block overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/service/2.png"
            alt="Kho quà trợ giá lên đời máy mới"
            className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        </Link>
      </div>
    </section>
  );
}
