'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { uploadReviewMedia } from '../services/reviews-api';

const MAX_IMAGES = 5;
const MAX_VIDEOS = 2;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';

export type ReviewMediaItem = {
  url: string;
  mediaType: 'image' | 'video';
  previewUrl?: string;
};

type ReviewMediaUploadFieldProps = {
  productId: string;
  images: string[];
  videos: string[];
  disabled?: boolean;
  onChange: (next: { images: string[]; videos: string[] }) => void;
};

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  return `${Math.round(bytes / 1024)}KB`;
}

export function ReviewMediaUploadField({
  productId,
  images,
  videos,
  disabled = false,
  onChange,
}: ReviewMediaUploadFieldProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const removeImage = (url: string) => {
    onChange({ images: images.filter((item) => item !== url), videos });
  };

  const removeVideo = (url: string) => {
    onChange({ images, videos: videos.filter((item) => item !== url) });
  };

  const handleUpload = async (file: File, mediaType: 'image' | 'video') => {
    if (mediaType === 'image' && images.length >= MAX_IMAGES) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh`);
      return;
    }
    if (mediaType === 'video' && videos.length >= MAX_VIDEOS) {
      toast.error(`Tối đa ${MAX_VIDEOS} video`);
      return;
    }

    if (mediaType === 'image' && file.size > MAX_IMAGE_BYTES) {
      toast.error('Ảnh tối đa 10MB');
      return;
    }
    if (mediaType === 'video' && file.size > MAX_VIDEO_BYTES) {
      toast.error('Video tối đa 25MB');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadReviewMedia(productId, file);
      if (result.mediaType === 'video') {
        onChange({ images, videos: [...videos, result.url] });
      } else {
        onChange({ images: [...images, result.url], videos });
      }
      toast.success(`Đã tải lên ${mediaType === 'video' ? 'video' : 'ảnh'} (${formatSize(result.size)})`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải media lên');
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    void handleUpload(file, 'image');
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    void handleUpload(file, 'video');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || uploading || images.length >= MAX_IMAGES}
          onClick={() => imageInputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded border border-outline-variant bg-surface px-4 text-label-sm font-bold text-on-surface transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Thêm ảnh
        </button>
        <button
          type="button"
          disabled={disabled || uploading || videos.length >= MAX_VIDEOS}
          onClick={() => videoInputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded border border-outline-variant bg-surface px-4 text-label-sm font-bold text-on-surface transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
          Thêm video
        </button>
        <span className="text-label-sm text-on-surface-variant">
          Ảnh tối đa 10MB · Video tối đa 25MB
        </span>
      </div>

      {(images.length > 0 || videos.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {images.map((image) => (
            <div key={image} className="group relative">
              <img src={image} alt="Ảnh đánh giá" className="h-20 w-20 rounded border border-outline-variant object-cover" />
              <button
                type="button"
                onClick={() => removeImage(image)}
                disabled={disabled || uploading}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-40"
                aria-label="Xóa ảnh"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {videos.map((video) => (
            <div key={video} className="group relative">
              <video src={video} className="h-20 w-28 rounded border border-outline-variant object-cover" controls preload="metadata" />
              <button
                type="button"
                onClick={() => removeVideo(video)}
                disabled={disabled || uploading}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-40"
                aria-label="Xóa video"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={imageInputRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" onChange={handleImageChange} />
      <input ref={videoInputRef} type="file" accept={VIDEO_ACCEPT} className="sr-only" onChange={handleVideoChange} />
    </div>
  );
}
