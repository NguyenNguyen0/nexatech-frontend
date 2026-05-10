type CartPromoBoxProps = {
  canUseCode?: boolean;
};

export function CartPromoBox({ canUseCode = true }: CartPromoBoxProps) {
  return (
    <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      <h3 className="text-base font-bold text-text-primary">Ưu đãi dành cho bạn</h3>
      <p className="mt-2 text-sm text-text-secondary">
        Nhập mã khuyến mãi ở bước thanh toán để nhận ưu đãi tốt nhất cho đơn hàng.
      </p>
      <div className="mt-4 rounded-2xl bg-bg-base px-4 py-3 text-sm text-text-secondary">
        {canUseCode ? 'Mã có hiệu lực sẽ được áp dụng tự động nếu phù hợp điều kiện.' : 'Hiện chưa có mã áp dụng cho giỏ hàng này.'}
      </div>
    </section>
  );
}
