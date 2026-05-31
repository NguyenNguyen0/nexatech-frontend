'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/custom/user-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_BYTES = 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export type AvatarUploadFieldProps = {
  currentUrl?: string | null;
  displayName?: string | null;
  disabled?: boolean;
  className?: string;
  onFileSelected?: (file: File, previewUrl: string) => void;
};

export function AvatarUploadField({
  currentUrl,
  displayName,
  disabled = false,
  className,
  onFileSelected,
}: AvatarUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh (JPG, PNG, WebP, GIF)');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Ảnh tối đa 1MB');
      return;
    }

    setPicking(true);
    try {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelected?.(file, url);
    } finally {
      setPicking(false);
    }
  }

  const shownUrl = previewUrl ?? currentUrl ?? null;

  return (
    <div className={cn('flex flex-col items-center gap-3 sm:flex-row sm:items-start', className)}>
      <div className="relative">
        <UserAvatar avatarUrl={shownUrl} name={displayName} size="lg" className="h-20 w-20 text-xl" />
        {!disabled && (
          <button
            type="button"
            onClick={openPicker}
            disabled={picking}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md transition hover:bg-primary/90 disabled:opacity-60"
            aria-label="Chọn ảnh đại diện"
          >
            {picking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 text-center sm:text-left">
        <p className="text-sm font-medium text-text-primary">Ảnh đại diện</p>
        <p className="text-xs text-text-tertiary max-w-[240px]">
          JPG, PNG, WebP hoặc GIF — tối đa 1MB. Ảnh sẽ được lưu khi bạn bấm &quot;Lưu thay đổi&quot;.
        </p>
        {disabled ? (
          <p className="text-xs text-text-tertiary">Bấm &quot;Chỉnh sửa&quot; để thay ảnh đại diện.</p>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={openPicker} disabled={picking} className="w-fit">
            {picking ? 'Đang xử lý…' : 'Chọn ảnh từ máy'}
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileChange}
      />
    </div>
  );
}
