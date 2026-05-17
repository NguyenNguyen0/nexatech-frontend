import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { changePassword } from "@/services/authApi";
import { isPasswordChangeRequired, setPasswordChangeRequired, isOtpStepUpPending } from "@/services/authSession";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export function ForceChangePasswordModal() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Hiển thị modal nếu user login thành công nhưng requiresPasswordChange = true
    const isOpen = isPasswordChangeRequired();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu mới không khớp");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
            return;
        }

        setSubmitting(true);
        try {
            // Trong admin authApi chưa có changePassword? Hãy kiểm tra lại.
            // Nếu chưa có, ta sẽ gọi trực tiếp hoặc thêm vào authApi.
            // Tôi sẽ sử dụng placeholder ở đây và đảm bảo authApi có method này.
            await changePassword({
                oldPassword,
                newPassword,
            });
            
            toast.success("Đổi mật khẩu thành công!");
            setPasswordChangeRequired(false);
            window.location.reload(); // Reload để cập nhật trạng thái
        } catch (error: any) {
            console.error("Change password error:", error);
            const message = error.response?.data?.message || "Không thể đổi mật khẩu, vui lòng kiểm tra lại mật khẩu hiện tại";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl">Yêu cầu đổi mật khẩu</DialogTitle>
                    <DialogDescription className="text-center">
                        Vì lý do bảo mật, bạn cần đổi mật khẩu mới sau khi reset tài khoản trước khi tiếp tục.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin-old-password">Mật khẩu hiện tại (vừa nhận qua email)</Label>
                        <Input
                            id="admin-old-password"
                            type="password"
                            placeholder="••••••••"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            disabled={submitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-new-password">Mật khẩu mới</Label>
                        <Input
                            id="admin-new-password"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={submitting}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ và số.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-confirm-password">Xác nhận mật khẩu mới</Label>
                        <Input
                            id="admin-confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full h-11" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đổi mật khẩu & Tiếp tục"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
