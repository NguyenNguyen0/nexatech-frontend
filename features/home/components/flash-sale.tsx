'use client';

export function FlashSale() {
  const products = [
    { name: 'Nồi chiên không dầu 5L 1500W Bear AF-4H15L', price: '1.090.000', oldPrice: '1.900.000', discount: '54%' },
    { name: 'Máy vắt cam 0.4L 30W Bear JU-4H04X', price: '346.000', oldPrice: '500.000', discount: '30%' },
    { name: 'Máy xay kéo tay 200ml Bear FCH-5N02R35', price: '189.000', oldPrice: '190.000', discount: '1%' },
    { name: 'Nồi chiên không dầu 5L Bear QZG-J15M1', price: '854.000', oldPrice: '2.150.000', discount: '60%' },
    { name: 'Máy xay thực phẩm đa năng 600ml Bear', price: '448.000', oldPrice: '700.000', discount: '36%' },
    { name: 'Bếp nướng điện đa năng Bear', price: '550.000', oldPrice: '990.000', discount: '44%' },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-4 mb-4">
      <div className="rounded-lg overflow-hidden relative shadow-sm" style={{ background: 'linear-gradient(180deg, #b00005 0%, #680000 100%)', padding: '4px' }}>
        <div className="bg-white rounded overflow-hidden">
          {/* Header */}
          <div className="flex border-b overflow-x-auto">
            <div className="px-6 py-3 font-bold text-[#cb1c22] border-b-[3px] border-[#cb1c22] whitespace-nowrap cursor-pointer">
              FLASH SALE GIA DỤNG BEAR
            </div>
            <div className="px-6 py-3 font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
              FLASH SALE MEGA SALE THÁNG 04
            </div>
          </div>
          {/* Products */}
          <div className="flex overflow-x-auto gap-4 p-4 items-stretch" style={{ scrollbarWidth: 'none' }}>
            {products.map((item, i) => (
              <div key={i} className="min-w-[210px] w-[210px] flex flex-col p-3 border border-transparent hover:border-gray-200 hover:shadow-lg rounded-lg transition-all cursor-pointer bg-white group shrink-0">
                <div className="relative aspect-square bg-[#f9f9f9] rounded mb-3">
                  <span className="absolute top-2 right-2 bg-[#cb1c22] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">↓ {item.discount}</span>
                  <span className="absolute top-2 left-2 border border-gray-300 bg-white text-gray-500 text-[9px] font-medium px-1 rounded">Trả góp 0%</span>
                  <img src={`https://picsum.photos/seed/bear${i}/150/150`} className="w-full h-full object-contain mix-blend-multiply p-4 group-hover:-translate-y-1 transition-transform" alt="Product" />
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-200 rounded-full overflow-hidden text-[9px] text-white font-bold flex items-center">
                    <div className="bg-gradient-to-r from-orange-400 to-[#cb1c22] h-full flex items-center justify-center pl-4 pr-2" style={{ width: `${80 - i * 10}%` }}>
                      <span className="absolute left-1">🔥</span> Còn {10 - i}/10 suất
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-800 line-clamp-2 min-h-[40px] font-medium leading-tight group-hover:text-primary">{item.name}</div>
                <div className="text-[#cb1c22] font-black text-lg mt-1">{item.price} ₫</div>
                <div className="text-gray-400 line-through text-xs">{item.oldPrice} ₫</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
