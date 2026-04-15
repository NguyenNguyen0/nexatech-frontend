'use client';

export function QuickLinks() {
    const links = [
        { name: 'iPhone 17 Pro Max', img: 'https://picsum.photos/seed/q1/80/80' },
        { name: 'Galaxy S26 Ultra', img: 'https://picsum.photos/seed/q2/80/80' },
        { name: 'Redmi Note 15', img: 'https://picsum.photos/seed/q3/80/80' },
        { name: 'iPhone 16 Pro Max Cũ', img: 'https://picsum.photos/seed/q4/80/80' },
        { name: 'iPhone', img: 'https://picsum.photos/seed/q5/80/80' },
        { name: 'Galaxy A', img: 'https://picsum.photos/seed/q6/80/80' },
        { name: 'Oppo Reno16', img: 'https://picsum.photos/seed/q7/80/80' },
        { name: 'Samsung Cũ', img: 'https://picsum.photos/seed/q8/80/80' },
        { name: 'iPad', img: 'https://picsum.photos/seed/q9/80/80' },
        { name: 'Galaxy Tab S11', img: 'https://picsum.photos/seed/q10/80/80' },
        { name: 'Xiaomi 15T 5G', img: 'https://picsum.photos/seed/q11/80/80' },
        { name: 'iPhone Cũ giá rẻ', img: 'https://picsum.photos/seed/q12/80/80' },

        { name: 'JBL Flip 7', img: 'https://picsum.photos/seed/q13/80/80' },
        { name: 'Huawei GT6 46MM', img: 'https://picsum.photos/seed/q14/80/80' },
        { name: 'AirPods', img: 'https://picsum.photos/seed/q15/80/80' },
        { name: 'Bình giữ nhiệt', img: 'https://picsum.photos/seed/q16/80/80' },
        { name: 'Macbook Neo', img: 'https://picsum.photos/seed/q17/80/80' },
        { name: 'Tai nghe chính hãng', img: 'https://picsum.photos/seed/q18/80/80' },
        { name: 'Huawei Matepad', img: 'https://picsum.photos/seed/q19/80/80' },
        { name: 'Gia dụng Bear', img: 'https://picsum.photos/seed/q20/80/80' },
        { name: 'Xe máy điện', img: 'https://picsum.photos/seed/q21/80/80' },
        { name: 'Phụ kiện', img: 'https://picsum.photos/seed/q22/80/80' },
        { name: 'Lên đời siêu hời', img: 'https://picsum.photos/seed/q23/80/80' },
        { name: 'Vòng đeo tay thông minh', img: 'https://picsum.photos/seed/q24/80/80' }
    ];

    return (
        <section className="max-w-[1200px] mx-auto px-4 py-4">
            <div className="bg-background rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border/50">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-y-6 gap-x-2">
                    {links.map((link, i) => (
                        <a key={i} href="#" className="flex flex-col items-center gap-2 group text-center">
                            <div className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] bg-[#fff0f1] border border-red-100 rounded-[18px] flex items-center justify-center p-2 group-hover:-translate-y-1 transition-transform duration-300 relative">
                                <img src={link.img} alt={link.name} className="object-contain w-full h-full mix-blend-multiply" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-foreground/80 leading-[1.2] px-1 line-clamp-2 max-w-[80px]">
                                {link.name}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
