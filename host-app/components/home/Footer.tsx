'use client';

export function Footer() {
    return (
        <footer className="w-full bg-white pt-10 pb-6 border-t mt-8">
            <div className="max-w-[1200px] mx-auto px-4">
                {/* Top Info Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-sm">
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 tracking-tight">Về chúng tôi</h4>
                        <ul className="space-y-2.5 text-black">
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Giới thiệu công ty
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Khách hàng Doanh nghiệp (B2B)
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary text-[#cb1c22]">
                                    Ưu đãi dành cho giáo dục
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Danh sách cửa hàng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Tuyển dụng mới nhất
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Hướng dẫn mua hàng Online
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Hướng dẫn mua hàng trả góp
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Hướng dẫn thanh toán VNPAY
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 tracking-tight">Chính sách</h4>
                        <ul className="space-y-2.5 text-black">
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Chính sách bảo hành
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Chính sách bán hàng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Chính sách bảo mật
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Chính sách kiểm hàng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary">
                                    Trung tâm bảo hành Apple tại Việt Nam
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 tracking-tight">Tổng đài hỗ trợ (Miễn phí)</h4>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-800 font-medium">Mua ngay:</span>
                                <div className="text-right">
                                    <span className="text-[#cb1c22] font-bold text-base">1800.6018</span>
                                    <span className="text-xs text-gray-500 block">07:30 - 21:30</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-800 font-medium pr-2">Bảo hành tại Viện Di Động:</span>
                                <div className="text-right">
                                    <span className="text-[#cb1c22] font-bold text-base">1800.6729</span>
                                    <span className="text-xs text-gray-500 block">08:00 - 21:00</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-800 font-medium">Góp ý:</span>
                                <div className="text-right">
                                    <span className="text-[#cb1c22] font-bold text-base">1800.6306</span>
                                    <span className="text-xs text-gray-500 block">08:30 - 21:30</span>
                                </div>
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-3 tracking-tight">Phương thức thanh toán</h4>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="h-8 border rounded flex items-center justify-center p-1">
                                <img
                                    src="https://picsum.photos/seed/pay1/40/20"
                                    alt="pay"
                                    className="mix-blend-multiply"
                                />
                            </div>
                            <div className="h-8 border rounded flex items-center justify-center p-1">
                                <img
                                    src="https://picsum.photos/seed/pay2/40/20"
                                    alt="pay"
                                    className="mix-blend-multiply"
                                />
                            </div>
                            <div className="h-8 border rounded flex items-center justify-center p-1">
                                <img
                                    src="https://picsum.photos/seed/pay3/40/20"
                                    alt="pay"
                                    className="mix-blend-multiply"
                                />
                            </div>
                            <div className="h-8 border rounded flex items-center justify-center p-1">
                                <img
                                    src="https://picsum.photos/seed/pay4/40/20"
                                    alt="pay"
                                    className="mix-blend-multiply"
                                />
                            </div>
                            <div className="h-8 border rounded flex items-center justify-center p-1">
                                <img
                                    src="https://picsum.photos/seed/pay5/40/20"
                                    alt="pay"
                                    className="mix-blend-multiply"
                                />
                            </div>
                            <div className="h-8 border rounded flex items-center justify-center p-1">
                                <img
                                    src="https://picsum.photos/seed/pay6/40/20"
                                    alt="pay"
                                    className="mix-blend-multiply"
                                />
                            </div>
                            <div className="h-8 border rounded flex items-center justify-center p-1">
                                <img
                                    src="https://picsum.photos/seed/pay7/40/20"
                                    alt="pay"
                                    className="mix-blend-multiply"
                                />
                            </div>
                            <div className="h-8 border rounded flex items-center justify-center p-1">
                                <img
                                    src="https://picsum.photos/seed/pay8/40/20"
                                    alt="pay"
                                    className="mix-blend-multiply"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-3 tracking-tight">Kết nối với Nexatech</h4>
                        <div className="flex gap-2 mb-6">
                            <span className="w-8 h-8 rounded-full bg-[#0068ff] text-white flex items-center justify-center text-xs font-bold font-serif italic">
                                Zalo
                            </span>
                            <span className="w-8 h-8 rounded-full bg-[#1877f2] text-white flex items-center justify-center font-bold font-serif text-lg">
                                f
                            </span>
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                    background:
                                        'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                                }}
                            >
                                <span
                                    className="text-white text-xs font-bold outline outline-[1.5px] outline-white rounded p-0.5"
                                    style={{ width: '16px', height: '16px' }}
                                ></span>
                            </div>
                            <span className="w-8 h-8 rounded-full bg-[#ff0000] text-white flex items-center justify-center">
                                ▶
                            </span>
                            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold italic">
                                d
                            </span>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-3 tracking-tight">Đối tác Nexatech</h4>
                        <div className="flex gap-2 mb-6">
                            <div className="h-8 w-24 bg-black rounded flex items-center justify-center text-[8px] font-bold text-yellow-500">
                                VIỆN DI ĐỘNG
                            </div>
                            <div className="h-8 w-24 bg-black rounded flex items-center justify-center text-[10px] tracking-widest font-serif text-white">
                                VERTU
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-3 tracking-tight">
                            Tải ngay ứng dụng nhận nhiều ưu đãi
                        </h4>
                        <div className="flex gap-4 items-center">
                            <img
                                src="https://picsum.photos/seed/qr/80/80"
                                className="w-20 h-20 bg-gray-100 p-1 rounded"
                                alt="QR Code"
                            />
                            <div className="flex flex-col gap-2">
                                <div className="h-9 w-28 bg-black rounded flex items-center justify-center gap-1 text-white border border-gray-600 cursor-pointer">
                                    <span className="text-lg">🍎</span>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[8px]">Tải ứng dụng trên</span>
                                        <span className="text-xs font-bold">App Store</span>
                                    </div>
                                </div>
                                <div className="h-9 w-28 bg-black rounded flex items-center justify-center gap-1 text-white border border-gray-600 cursor-pointer">
                                    <span className="text-lg">▶</span>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[8px] tracking-tight">Tải ứng dụng trên</span>
                                        <span className="text-xs font-bold leading-tight">Google Play</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom SEO & Certificate Block */}
            <div className="bg-[#f5f5f5] w-full pt-6 pb-20">
                <div className="max-w-[1200px] mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-6">
                        <div>
                            <p className="font-bold text-black mb-1">Điện thoại iPhone</p>
                            <p>iPhone 17 | iPhone Air</p>
                            <p>iPhone 16</p>
                        </div>
                        <div>
                            <p className="font-bold text-black mb-1">Điện thoại Samsung Galaxy</p>
                            <p>Samsung Galaxy S26</p>
                            <p>Samsung Z Fold 7 | Samsung Z Flip 7</p>
                        </div>
                        <div>
                            <p className="font-bold text-black mb-1">Điện thoại Xiaomi | Điện thoại Oppo</p>
                            <p>Điện thoại Realme | Điện thoại Tecno</p>
                            <p>Xiaomi 15</p>
                        </div>
                        <div>
                            <p className="font-bold text-black mb-1">MacBook | MacBook Pro | MacBook Air</p>
                            <p>Máy tính bảng iPad</p>
                            <p>Tai nghe Airpods</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-t border-gray-300 pt-6">
                        <div className="text-[10px] text-gray-500 leading-relaxed max-w-4xl space-y-1">
                            <p>
                                Công Ty Cổ Phần Công Nghệ Nexatech - 77 Trần Quang Khải, P. Tân Định, TP. Hồ Chí Minh.
                                Mã số doanh nghiệp: 0312192244, nơi cấp: Sở Tố Kế hoạch Đầu tư TP Hồ Chí Minh.
                            </p>
                            <p>
                                SĐT: 0312192244 - Đại diện theo pháp luật: Nguyễn Ngọc Đạt - Điện thoại: 1800.6018 (miễn
                                phí) - Email: lienhe@didongviet.vn - Bản quyền thuộc về Nexatech.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <img
                                src="https://picsum.photos/seed/cert1/80/30"
                                alt="cert1"
                                className="h-8 mix-blend-multiply"
                            />
                            <img
                                src="https://picsum.photos/seed/cert2/80/30"
                                alt="cert2"
                                className="h-8 mix-blend-multiply"
                            />
                            <img
                                src="https://picsum.photos/seed/cert3/100/30"
                                alt="cert3"
                                className="h-8 mix-blend-multiply"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
