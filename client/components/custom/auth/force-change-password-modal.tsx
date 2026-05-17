'use client';

import { useEffect, useState } from 'react';
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
import { authStorage } from '@/features/auth/utils/auth-storage';

export function ForceChangePasswordModal() {
  const { data: session, update } = useSession();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isOpen =
    !!session?.user && !!session.requiresPasswordChange && !isSuccess;

  useEffect(() => {
    if (session?.accessToken && session.refreshToken) {
      authStorage.setTokens(session.accessToken, session.refreshToken);
    }
  }, [session?.accessToken, session?.refreshToken]);

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

    const accessToken =
      session?.accessToken ?? authStorage.getAccessToken() ?? undefined;
    if (!accessToken) {
      toast.error('Phiên đăng nhập chưa sẵn sàng. Tải lại trang rồi thử lại.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axiosClient.post<{ code: number; message?: string }>(
        authPaths.changePassword,
        {
          newPassword,
          initialSetup: true,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (data.code !== 1000) {
        throw new Error(data.message || 'Không thể đặt mật khẩu');
      }

      toast.success('Đặt mật khẩu thành công!');
      setIsSuccess(true);
      await update({ passwordChangeComplete: true });
    } catch (error: unknown) {
      console.error('Change password error:', error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể đặt mật khẩu, vui lòng thử lại';
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
          <DialogTitle className="text-center text-xl">Đặt mật khẩu NexaTech</DialogTitle>
          <DialogDescription className="text-center">
            Tạo mật khẩu đăng nhập cho NexaTech.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              Ít nhất 8 ký tự, có chữ và số (ví dụ: Abc@123456789).
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
                'Lưu mật khẩu & Tiếp tục'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
