export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — will be implemented in Phase 5b from internal/AppShell */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-sidebar text-sidebar-foreground">
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/nexatech.png"
            alt="NexaTech"
            className="h-7 w-auto object-contain"
          />
        </div>
        <nav className="flex-1 p-3 space-y-1 text-sm">
          <NavItem href="/admin/dashboard" label="Dashboard" />
          <NavItem href="/admin/product" label="Sản phẩm" />
          <NavItem href="/admin/order" label="Đơn hàng" />
          <NavItem href="/admin/users" label="Người dùng" />
          <NavItem href="/admin/kanban" label="Kanban" />
          <NavItem href="/admin/calendar" label="Lịch" />
          <NavItem href="/admin/chats" label="Tin nhắn" />
          <NavItem href="/admin/tasks" label="Tasks" />
          <NavItem href="/admin/supports" label="Hỗ trợ" />
          <NavItem href="/admin/emails" label="Email" />
          <NavItem href="/admin/settings" label="Cài đặt" />
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center px-6 justify-between">
          <h2 className="font-semibold text-foreground">Admin Panel</h2>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
    >
      {label}
    </a>
  );
}
