import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBrandGoogle } from "@tabler/icons-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, login, persistTokensFromExchange } from "@/services/authApi";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { useNavigate } from "react-router-dom";
import { clearAuthTokens, getAccessToken, getDefaultPathByRole, getRolesFromAccessToken } from "@/lib/authRouting";

interface LoginFormProps {
    toggleMode: () => void;
}

export function LoginForm({ toggleMode }: LoginFormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await login({
                username: username.trim(),
                password,
            });
            persistTokensFromExchange(result);
            toast.success("Login successful");
            const token = getAccessToken();
            const roles = getRolesFromAccessToken(token);
            if (roles.includes("CUSTOMER")) {
                clearAuthTokens();
                toast.error("Your action is not allowed with role CUSTOMER");
                navigate("/auth", { replace: true });
                return;
            }

            const path = getDefaultPathByRole(roles);
            navigate(path, { replace: true });
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Login failed"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username / Email</Label>
                        <Input
                            id="username"
                            placeholder="name@example.com"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={submitting}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <ForgotPasswordModal />
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={submitting}>
                        {submitting ? "Signing in..." : "Sign In"}
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <Button onClick={() => toast.info('This feature is not implemented yet')} variant="outline" type="button" className="w-full">
                <IconBrandGoogle className="mr-2 h-4 w-4" /> Google
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button type="button" onClick={toggleMode} className="underline underline-offset-4 hover:text-primary">Sign up</button>
            </p>
        </div>
    );
}
