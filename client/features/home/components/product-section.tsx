'use client';

import { Star } from 'lucide-react';

export function ProductSection() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-4 mb-4">
      {/* iPhone Block */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3 border-b pb-3">
          <h2 className="text-xl font-bold text-[#cb1c22]">iPhone Chính Hãng (Apple Authorized Reseller)</h2>
          <div className="flex gap-2 flex-wrap">
            {['iPhone Air', 'iPhone 16 Series', 'iPhone 15 Series', 'Xem tất cả', 'iPhone 17 Series'].map((label) => (
              <span key={label} className="border rounded-full px-3 py-1 text-xs cursor-pointer hover:border-[#cb1c22] hover:text-[#cb1c22] transition-colors">{label}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col group cursor-pointer p-2 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg border border-transparent hover:border-gray-100 transition-all duration-300">
              <div className="relative aspect-[4/5] bg-[#f9f9f9] mb-3 rounded-lg overflow-hidden flex items-center justify-center">
                <span className="absolute top-2 left-2 border border-[#cb1c22] text-[#cb1c22] text-[9px] font-bold px-1 rounded bg-white">MẪU MỚI</span>
                <span className="absolute top-2 right-2 bg-[#cb1c22] text-white text-[10px] font-bold px-1.5 rounded shadow-sm">↓ 12%</span>
                <img src={`https://picsum.photos/seed/ip${i}/150/180`} className="w-[80%] h-[80%] object-contain group-hover:-translate-y-2 transition-transform duration-300 mix-blend-multiply" alt="iPhone" />
              </div>
              <span className="text-[9px] font-bold bg-[#cb1c22] text-white w-max px-1.5 py-0.5 rounded mb-2">MỚI RA MẮT</span>
              <div className="text-sm font-bold line-clamp-2 min-h-[40px] text-gray-800 leading-tight group-hover:text-primary transition-colors">iPhone 17e 256GB Chính Hãng</div>
              <div className="text-[#cb1c22] font-black text-lg mt-1 leading-none">17.590.000 ₫</div>
              <div className="text-gray-400 line-through text-xs mb-2 mt-1">17.990.000 ₫</div>
              <div className="bg-gray-50 rounded p-1.5 text-[10px] text-gray-600 leading-tight border border-gray-100 mt-auto">
                <p>Trả góp <span className="text-[#cb1c22] font-bold">0%</span> lãi suất</p>
              </div>
              <div className="flex items-center gap-0.5 mt-2 text-yellow-400">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 fill-current" />)}
                <span className="text-[10px] text-gray-400 ml-1 font-medium">4.8</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Samsung Block */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3 border-b pb-3">
          <h2 className="text-xl font-bold text-[#cb1c22]">Samsung Chính Hãng</h2>
          <div className="flex gap-2 flex-wrap">
            {['Galaxy Z Fold7', 'Galaxy Z Flip7', 'Galaxy S25 Series', 'Xem tất cả'].map((label) => (
              <span key={label} className="border rounded-full px-3 py-1 text-xs cursor-pointer hover:border-[#cb1c22] hover:text-[#cb1c22] transition-colors">{label}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col group cursor-pointer p-2 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg border border-transparent hover:border-gray-100 transition-all duration-300">
              <div className="relative aspect-[4/5] bg-[#f9f9f9] mb-3 rounded-lg overflow-hidden flex items-center justify-center">
                <span className="absolute top-2 left-2 border border-gray-300 bg-white text-gray-500 text-[9px] font-bold px-1 rounded">Trả góp 0%</span>
                <span className="absolute top-2 right-2 bg-[#cb1c22] text-white text-[10px] font-bold px-1.5 rounded shadow-sm">↓ {10+i}%</span>
                <img src={`https://picsum.photos/seed/ss${i}/150/180`} className="w-[80%] h-[80%] object-contain group-hover:-translate-y-2 transition-transform duration-300 mix-blend-multiply" alt="Samsung Galaxy" />
              </div>
              <span className="text-[9px] font-bold bg-[#cb1c22] text-white w-max px-1.5 py-0.5 rounded mb-2">MỚI RA MẮT</span>
              <div className="text-sm font-bold line-clamp-2 min-h-[40px] text-gray-800 leading-tight group-hover:text-primary transition-colors">Samsung Galaxy S26 Ultra 256GB Chính Hãng</div>
              <div className="text-[#cb1c22] font-black text-lg mt-1 leading-none">31.290.000 ₫</div>
              <div className="text-gray-400 line-through text-xs mb-2 mt-1">36.000.000 ₫</div>
              <div className="bg-gray-50 rounded p-1.5 text-[10px] text-gray-600 leading-tight border border-gray-100 mt-auto">
                <p>Trade-in giảm đến <span className="text-[#cb1c22] font-bold">5 triệu</span>...</p>
              </div>
              <div className="flex items-center gap-0.5 mt-2 text-yellow-400">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 fill-current" />)}
                <span className="text-[10px] text-gray-400 ml-1 font-medium">4.7</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
