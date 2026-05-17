import { Truck } from 'lucide-react';

export function PromoBanner() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Voucher Banner - matches Stitch blue */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#004d75] to-[#006699] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold tracking-wide">Voucher</p>
              <p className="mt-1 text-[13px] text-white/85">
                Mã code{' '}
                <span className="ml-1 inline-block rounded bg-white/20 px-2 py-0.5 font-mono text-[12px] font-bold tracking-wider">
                  4GH-0090
                </span>
              </p>
            </div>
            <div className="rounded-md border-2 border-white/50 bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Code</p>
              <p className="text-[15px] font-bold tracking-wider">HULOCRSD</p>
            </div>
          </div>
        </div>

        {/* Free Shipping Banner - matches Stitch blue */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#005580] to-[#0073a8] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold tracking-wide">Free Shipping</p>
              <p className="mt-1 text-[13px] text-white/85">Giao hàng miễn phí</p>
            </div>
            <Truck className="h-12 w-12 text-white/60" />
          </div>
        </div>
      </div>
    </section>
  );
}
