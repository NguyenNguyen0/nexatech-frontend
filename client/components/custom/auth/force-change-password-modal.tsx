'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import axiosClient from '@/lib/axios-client';
import { authPaths } from '@/lib/constants';

export function ForceChangePasswordModal() {
  const { data: session, update } = useSession();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Hiển thị modal nếu user login thành công nhưng requiresPasswordChange = true
  const isOpen = !!session?.user && !!session.requiresPasswordChange && !isSuccess;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      await axiosClient.post(authPaths.changePassword, {
        oldPassword,
        newPassword,
      });
      
      toast.success('Đổi mật khẩu thành công!');
      setIsSuccess(true);
      // Cập nhật session để ẩn modal
      await update({ passwordChangeComplete: true });
    } catch (error: any) {
      console.error('Change password error:', error);
      const message = error.response?.data?.message || 'Không thể đổi mật khẩu, vui lòng kiểm tra lại mật khẩu hiện tại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[450px]" hideCloseButton={true}>
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
            <Label htmlFor="old-password">Mật khẩu hiện tại (vừa nhận qua email)</Label>
            <Input
              id="old-password"
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input
              id="new-password"
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
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirm-password"
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
                'Đổi mật khẩu & Tiếp tục'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
