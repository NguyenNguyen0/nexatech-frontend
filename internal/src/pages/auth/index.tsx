import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BrandPanel } from "./components/BrandPanel";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";

export default function AuthPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "login";
    const isLogin = mode === "login";

    const toggleMode = (newMode: "login" | "register") => {
        setSearchParams({ mode: newMode });
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background">
            <div className={`flex min-h-screen w-full ${isLogin ? "flex-row" : "flex-row-reverse"}`}>
                <BrandPanel isLogin={isLogin} />

                {/* Form Side */}
                <motion.div
                    layout="position"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2"
                >
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col space-y-6"
                                >
                                    <div className="flex flex-col space-y-2 text-center">
                                        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                                        <p className="text-sm text-muted-foreground">Enter your email to sign in</p>
                                    </div>
                                    <LoginForm toggleMode={() => toggleMode("register")} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col space-y-6"
                                >
                                    <div className="flex flex-col space-y-2 text-center">
                                        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                                        <p className="text-sm text-muted-foreground">Enter your details to register</p>
                                    </div>
                                    <RegisterForm toggleMode={() => toggleMode("login")} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
