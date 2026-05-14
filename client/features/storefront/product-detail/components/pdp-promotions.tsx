

const PROMOTION_ITEMS = [
  'Tặng balo gaming cao cấp trị giá 1.500.000đ',
  'Tặng chuột gaming không dây trị giá 990.000đ',
  'Giảm thêm 5% tối đa 1.000.000đ khi thanh toán VNPAY',
];

export function PdpPromotions() {
  return (
    <section className="bg-surface rounded-xl p-4 border border-outline-variant">
      <h3 className="text-title-sm font-title-sm text-on-surface mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">featured_seasonal_and_gifts</span>
        Ưu đãi đặc biệt
      </h3>

      <ul className="flex flex-col gap-2">
        {PROMOTION_ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-2 text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check_circle</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
