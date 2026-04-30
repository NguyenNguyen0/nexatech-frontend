export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Trang bạn tìm kiếm không tồn tại.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
