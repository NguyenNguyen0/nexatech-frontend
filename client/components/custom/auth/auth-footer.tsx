import Image from 'next/image';
import Link from 'next/link';

export function AuthFooter() {
    return (
        <footer className="w-full border-t border-border/40 bg-[#fbfbfd]">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-16">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {/* Customer Service */}
                    <nav className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Dịch vụ khách hàng
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md px-1 -mx-1"
                                >
                                    Trung tâm trợ giúp Nexatech
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md px-1 -mx-1"
                                >
                                    Nexatech Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md px-1 -mx-1"
                                >
                                    Nexatech Mall
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md px-1 -mx-1"
                                >
                                    Hướng dẫn mua hàng
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* About */}
                    <nav className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Về Nexatech</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Giới thiệu về Nexatech Việt Nam
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Tuyển dùng
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Điều khoản Nexatech
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Payment */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Thanh toán</h3>
                        <div className="flex flex-wrap gap-2">
                            <div
                                className="h-6 w-10 bg-white shadow-sm border border-border/40 rounded flex items-center justify-center text-[8px] font-bold"
                                aria-label="VNPay"
                            >
                                VNPay
                            </div>
                            <div
                                className="h-6 w-10 bg-white shadow-sm border border-border/40 rounded flex items-center justify-center text-[8px] font-bold"
                                aria-label="MOMO"
                            >
                                MOMO
                            </div>
                            <div
                                className="h-6 w-10 bg-white shadow-sm border border-border/40 rounded flex items-center justify-center text-[8px] font-bold"
                                aria-label="SePay"
                            >
                                SePay
                            </div>
                        </div>
                    </div>

                    {/* Social */}
                    <nav className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Theo dõi chúng tôi
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Facebook
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Instagram
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    LinkedIn
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* App Download */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Tải ứng dụng Nexatech
                        </h3>
                        <div className="flex gap-3">
                            <div className="bg-white p-1 shadow-sm border border-border/40 rounded-lg">
                                <Image
                                    src="/mocks/QR-fake.png"
                                    alt="Quét mã QR để tải ứng dụng"
                                    width={80}
                                    height={80}
                                    className="h-20 w-20 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Nexatech. Tất cả các quyền được bảo lưu.</p>
                    <p>Quốc gia & Khu vực: Việt Nam</p>
                </div>
            </div>
        </footer>
    );
}
