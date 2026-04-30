import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ForgotPasswordModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button type="button" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Enter your email address and we will send you a link to reset your password.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reset-email" className="text-right">Email</Label>
                        <Input id="reset-email" placeholder="name@example.com" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button">Send Reset Link</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
