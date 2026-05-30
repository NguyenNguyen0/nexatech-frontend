'use client';

import Link from 'next/link';

export function PaymentPromos() {
  const promos = [
    { id: 1, image: '/payment/1.webp', alt: 'SCB Visa Giảm 800.000đ', href: '/promotions/scb' },
    { id: 2, image: '/payment/2.webp', alt: 'HOME PayLater Giảm 20%', href: '/promotions/home-paylater-1' },
    { id: 3, image: '/payment/3.webp', alt: 'HOME PayLater Khách hàng thân thiết', href: '/promotions/home-paylater-2' },
  ];

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-6">
      <h2 className="mb-4 text-lg font-bold text-[#1b1c1c]">
        Ưu đãi thanh toán
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none sm:grid sm:grid-cols-3 sm:pb-0">
        {promos.map((promo) => (
          <Link
            key={promo.id}
            href={promo.href}
            className="group block w-[85%] flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 shadow-sm transition-all duration-300 hover:shadow-md sm:w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={promo.image}
              alt={promo.alt}
              className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
