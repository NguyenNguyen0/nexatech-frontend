'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, persistTokensFromExchange, getApiErrorMessage } from '@/features/auth/services/auth-api';
import { getRolesFromAccessToken } from '@/features/auth/utils/auth-session';
import { getDefaultPathByRole } from '@/lib/constants';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ username, password });
      persistTokensFromExchange(result);
      toast.success('Đăng nhập thành công!');

      const roles = getRolesFromAccessToken(result.access_token);
      const targetPath = getDefaultPathByRole(roles);
      router.push(targetPath);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đăng nhập thất bại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/nexatech.png"
          alt="NexaTech"
          className="h-10 w-auto object-contain mx-auto mb-4 lg:hidden"
        />
        <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
        <p className="text-sm text-gray-500 mt-1">Chào mừng bạn trở lại NexaTech</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1">
            Tên đăng nhập
          </label>
          <Input
            id="login-username"
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-10"
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Đăng nhập
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Chưa có tài khoản?{' '}
        <Link href="/auth/register" className="text-primary font-medium hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
