import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBrandGithub } from "@tabler/icons-react";

interface RegisterFormProps {
    toggleMode: () => void;
}

export function RegisterForm({ toggleMode }: RegisterFormProps) {
    return (
        <div className="grid gap-6">
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" type="text" autoCapitalize="words" autoComplete="name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="name@example.com" type="email" autoCapitalize="none" autoComplete="email" autoCorrect="off" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                    <Button className="w-full" type="submit">Create Account</Button>
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
                Already have an account?{" "}
                <button type="button" onClick={toggleMode} className="underline underline-offset-4 hover:text-primary">Sign in</button>
            </p>
        </div>
    );
}
