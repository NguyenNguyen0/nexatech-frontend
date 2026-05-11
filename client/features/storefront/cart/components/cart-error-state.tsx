type CartErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function CartErrorState({ message, onRetry }: CartErrorStateProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-4xl border border-danger/30 bg-danger/5 px-6 py-12 text-center">
        <h2 className="text-xl font-bold text-text-primary">Không thể tải giỏ hàng</h2>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Tải lại
        </button>
      </div>
    </div>
  );
}
