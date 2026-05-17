type CartPromoBoxProps = {
  canUseCode?: boolean;
};

export function CartPromoBox({ canUseCode = true }: CartPromoBoxProps) {
  return (
    <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2">Mã giảm giá / Voucher</label>
      <div className="flex gap-2">
        <input 
          className="flex-grow h-10 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-body-md bg-surface-container-lowest uppercase" 
          placeholder="Nhập mã khuyến mãi" 
          type="text" 
          disabled={!canUseCode}
        />
        <button 
          className="h-10 px-4 bg-surface-container-high hover:bg-surface-variant text-on-surface font-medium rounded-lg transition-colors border border-outline-variant disabled:opacity-50"
          disabled={!canUseCode}
        >
          Áp dụng
        </button>
      </div>
      {!canUseCode && (
        <p className="mt-2 text-[11px] text-error">Bạn cần thêm sản phẩm vào giỏ hàng để sử dụng mã.</p>
      )}
    </div>
  );
}
