import { motion, AnimatePresence } from "framer-motion";
import NexatechLogoTransparent from "@/assets/brand/nexatech-logo-transparent-bg.png";

export function BrandPanel({ isLogin }: { isLogin: boolean }) {
    return (
        <motion.div
            layout="position"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden p-10 text-white lg:flex"
            style={{ background: 'var(--gradient-hero)' }}
        >
            {/* Background Watermark */}
            <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 blur-[1px]"
                aria-hidden="true"
            >
                <div className="transform scale-[1.5]">
                    <img src={NexatechLogoTransparent} alt="" className="h-[500px] w-[500px] object-contain brightness-0 invert" />
                </div>
            </div>

            {/* Brand Illustration */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-12">
                <div className="group relative">
                    <div
                        className="absolute -inset-4 rounded-full bg-[#90cdff]/30 opacity-60 blur-3xl transition-opacity group-hover:opacity-90"
                        aria-hidden="true"
                    />
                    <img
                        src={NexatechLogoTransparent}
                        alt="Nexatech Branding Illustration"
                        className="relative h-[300px] w-[300px] object-contain brightness-0 invert drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-transform hover:scale-105"
                    />
                </div>
                <div className="max-w-md space-y-4 text-center">
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={isLogin ? "login-title" : "register-title"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-3xl font-bold tracking-tight drop-shadow-lg"
                        >
                            {isLogin ? "Internal Dashboard" : "Join our Internal Dashboard"}
                            <p className="text-sm text-white/70 italic tracking-tight drop-shadow-lg">
                                {isLogin ? "" : "Trang này không publish khi triển khai!!"}
                            </p>
                        </motion.h2>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}