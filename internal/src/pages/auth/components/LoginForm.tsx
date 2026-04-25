import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBrandGithub } from "@tabler/icons-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, login, persistTokensFromExchange } from "@/lib/authApi";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

interface LoginFormProps {
    toggleMode: () => void;
}

export function LoginForm({ toggleMode }: LoginFormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await login({
                username: username.trim(),
                password,
            });
            persistTokensFromExchange(result);
            toast.success("Dang nhap thanh cong");
            window.location.href = "/";
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Dang nhap that bai"));
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
            <Button variant="outline" type="button" className="w-full">
                <IconBrandGithub className="mr-2 h-4 w-4" /> GitHub
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button type="button" onClick={toggleMode} className="underline underline-offset-4 hover:text-primary">Sign up</button>
            </p>
        </div>
    );
}
