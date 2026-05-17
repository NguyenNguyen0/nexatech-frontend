import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { forgotPassword, getApiErrorMessage } from "@/services/authApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ForgotPasswordModal() {
    const [identifier, setIdentifier] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    async function handleSubmit() {
        if (!identifier.trim()) {
            toast.error("Vui lòng nhập Email hoặc Username");
            return;
        }

        setSubmitting(true);
        try {
            await forgotPassword(identifier.trim());
            toast.success("Mật khẩu mới đã được gửi tới email của bạn (nếu tài khoản tồn tại).");
            setOpen(false);
            setIdentifier("");
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Không thể yêu cầu đặt lại mật khẩu"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button type="button" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Nhập Email hoặc Tên đăng nhập của bạn. Chúng tôi sẽ gửi mật khẩu mới qua email nếu tài khoản hợp lệ.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reset-identifier" className="text-right text-xs">Email/User</Label>
                        <Input 
                            id="reset-identifier" 
                            placeholder="username or email" 
                            className="col-span-3" 
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            disabled={submitting}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Hủy</Button>
                    <Button type="button" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang gửi...
                            </>
                        ) : "Gửi mật khẩu mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
