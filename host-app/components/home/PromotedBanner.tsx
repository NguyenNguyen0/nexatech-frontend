'use client';

export function PromotedBanner() {
    return (
        <section className="max-w-[1200px] mx-auto px-4 py-4 mb-4">
            <div className="w-full bg-[#4a557b] rounded-lg overflow-hidden shadow-sm flex flex-col md:flex-row items-stretch border border-[#3e4869]">
                {/* Visual */}
                <div className="w-full md:w-[35%] py-4 px-6 flex items-center bg-gradient-to-r from-[#3e4869] to-[#4a557b]">
                    <img
                        src="https://picsum.photos/seed/s26promo/200/150"
                        className="object-contain w-24 h-24 mr-4 mix-blend-screen"
                        alt="Galaxy S26"
                    />
                    <div className="text-white">
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-none mb-1">
                            Galaxy S26 Series
                        </h2>
                        <p className="text-blue-300 text-sm font-semibold">Galaxy AI ✨</p>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col sm:flex-row items-center justify-around py-4 px-4 gap-4 bg-white/5">
                    <div className="text-center sm:text-left flex items-center gap-4">
                        <div className="flex flex-col items-center sm:items-start text-white">
                            <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded mb-1">
                                Thu Cũ Đổi Mới
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm">
                                    Trợ giá
                                    <br />
                                    đến
                                </span>
                                <span className="text-3xl font-black text-white px-1">5</span>
                                <span className="text-xl font-bold">Triệu</span>
                            </div>
                        </div>

                        <div className="w-px h-12 bg-white/20 hidden sm:block mx-2"></div>

                        <div className="flex flex-col items-center sm:items-start text-white">
                            <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded mb-1">
                                Trả góp
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black px-1">0%</span>
                                <span className="text-sm border-l border-white/20 pl-2 ml-1 leading-tight">
                                    Đến
                                    <br />
                                    18 tháng
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-center sm:items-end justify-center min-w-[150px] gap-2">
                        <div className="text-white text-center sm:text-right">
                            <p className="text-sm opacity-80">Giá chỉ từ</p>
                            <p className="text-2xl font-black text-white">22.290.000đ</p>
                        </div>
                        <button className="bg-primary hover:bg-[#aa161c] text-white px-8 py-2 rounded-full font-bold transition-colors w-full sm:w-auto shadow-[0_4px_10px_rgba(203,28,34,0.3)] hover:shadow-[0_6px_15px_rgba(203,28,34,0.4)] hover:-translate-y-0.5 transform duration-200">
                            Mua ngay
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
