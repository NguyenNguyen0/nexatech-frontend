'use client';

export function QuickLinks() {
  const links = [
    { name: 'iPhone 17 Pro', icon: '📱' },
    { name: 'Galaxy S26 Ultra', icon: '📱' },
    { name: 'MacBook Pro', icon: '💻' },
    { name: 'iPad Air', icon: '📲' },
    { name: 'AirPods Pro', icon: '🎧' },
    { name: 'Apple Watch', icon: '⌚' },
    { name: 'Giảm Giá', icon: '🎁' },
    { name: 'Flash Sale', icon: '⚡' },
    { name: 'Trả Góp 0%', icon: '💳' },
    { name: 'Hàng Cũ Giá Rẻ', icon: '♻️' },
    { name: 'Phụ Kiện', icon: '🔌' },
    { name: 'Bảo Hành', icon: '✓' },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="bg-bg-elevated dark:bg-bg-elevated rounded-xl p-6 shadow-sm border border-border dark:border-border/50 transition-smooth">
        <h3 className="text-lg font-display font-bold text-text-primary dark:text-text-inverse mb-6">Danh mục nổi bật</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3 md:gap-4">
          {links.map((link, i) => (
            <a
              key={i}
              href="#"
              className="flex flex-col items-center gap-3 p-4 rounded-lg bg-gradient-to-b from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 hover:from-primary/15 hover:to-secondary/15 dark:hover:from-primary/15 dark:hover:to-secondary/15 transition-smooth group"
            >
              <div className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">{link.icon}</div>
              <span className="text-xs md:text-sm font-medium text-text-primary dark:text-text-inverse text-center line-clamp-2 leading-tight">
                {link.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
