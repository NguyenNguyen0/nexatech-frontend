'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ThumbsUp, PencilLine, Trash2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { createProductReview, deleteProductReview, markReviewHelpful, updateProductReview } from '../services/reviews-api';
import type { ProductReview, ReviewWriteBody } from '../types';

interface ProductReviewSectionProps {
  productId: string;
  productName: string;
  averageRating?: number;
  reviewCount?: number;
  initialReviews: ProductReview[];
}

const initialFormState: ReviewWriteBody = {
  rating: 5,
  title: '',
  content: '',
  images: [],
};

function renderStars(rating: number): JSX.Element[] {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index + 1 <= Math.round(rating);
    return <Star key={index} className={filled ? 'h-4 w-4 fill-warning text-warning' : 'h-4 w-4 text-border'} />;
  });
}

function parseImages(value: string): string[] {
  return value
    .split(',')
    .map((image) => image.trim())
    .filter(Boolean);
}

export function ProductReviewSection({
  productId,
  productName,
  averageRating,
  reviewCount,
  initialReviews,
}: ProductReviewSectionProps) {
  const router = useRouter();
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewWriteBody>(initialFormState);

  useEffect(() => {
    setHasAccessToken(Boolean(authStorage.getAccessToken()));
  }, []);

  const totalReviews = reviewCount ?? initialReviews.length;
  const ratingValue = typeof averageRating === 'number' ? averageRating : 0;

  const sortedReviews = useMemo(() => {
    return [...initialReviews].sort((left, right) => {
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightDate - leftDate;
    });
  }, [initialReviews]);

  const handleCreateReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createProductReview(productId, {
        rating: form.rating,
        title: form.title.trim(),
        content: form.content.trim(),
        images: form.images,
      });
      toast.success('Đã gửi đánh giá');
      setForm(initialFormState);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await markReviewHelpful(reviewId);
      toast.success('Đã ghi nhận đánh giá hữu ích');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi phản hồi');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Xóa đánh giá này?')) return;

    try {
      await deleteProductReview(reviewId);
      toast.success('Đã xóa đánh giá');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa đánh giá');
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>, reviewId: string) => {
    event.preventDefault();
    try {
      await updateProductReview(reviewId, draft);
      toast.success('Đã cập nhật đánh giá');
      setEditingId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật đánh giá');
    }
  };

  return (
    <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Đánh giá sản phẩm</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-text-primary">{productName}</h2>
          <div className="mt-3 flex items-center gap-3 text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1">{renderStars(ratingValue)}</span>
              <strong className="text-text-primary">{ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}</strong>
            </span>
            <span>{totalReviews} đánh giá</span>
          </div>
        </div>

        {hasAccessToken ? (
          <div className="rounded-2xl bg-primary/5 px-4 py-3 text-sm text-primary">
            Bạn có thể gửi đánh giá mới hoặc chỉnh sửa đánh giá đã tạo.
          </div>
        ) : (
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-base px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập để đánh giá
          </a>
        )}
      </div>

      {hasAccessToken ? (
        <form onSubmit={handleCreateReview} className="mt-6 grid gap-4 rounded-3xl border border-border bg-bg-base p-5">
          <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
            <label className="space-y-2 text-sm font-medium text-text-primary">
              <span>Chấm điểm</span>
              <select
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                className="h-11 w-full rounded-2xl border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} sao
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-text-primary">
              <span>Tiêu đề</span>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Sản phẩm tốt, đóng gói chắc chắn..."
                className="h-11 w-full rounded-2xl border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
                required
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-text-primary">
            <span>Nội dung</span>
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              className="w-full rounded-2xl border border-border bg-bg-elevated px-4 py-3 outline-none transition focus:border-primary"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-text-primary">
            <span>Ảnh minh họa</span>
            <input
              value={form.images.join(', ')}
              onChange={(event) => setForm((current) => ({ ...current, images: parseImages(event.target.value) }))}
              placeholder="https://... , https://..."
              className="h-11 w-full rounded-2xl border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
            />
          </label>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 space-y-4">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review) => {
            const isEditing = editingId === review.id;

            return (
              <article key={review.id} className="rounded-3xl border border-border bg-bg-base p-5">
                {isEditing ? (
                  <form onSubmit={(event) => handleEditSubmit(event, review.id)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                      <label className="space-y-2 text-sm font-medium text-text-primary">
                        <span>Chấm điểm</span>
                        <select
                          value={draft.rating}
                          onChange={(event) => setDraft((current) => ({ ...current, rating: Number(event.target.value) }))}
                          className="h-11 w-full rounded-2xl border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating} sao
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm font-medium text-text-primary">
                        <span>Tiêu đề</span>
                        <input
                          value={draft.title}
                          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                          className="h-11 w-full rounded-2xl border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
                          required
                        />
                      </label>
                    </div>

                    <label className="space-y-2 text-sm font-medium text-text-primary">
                      <span>Nội dung</span>
                      <textarea
                        value={draft.content}
                        onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-border bg-bg-elevated px-4 py-3 outline-none transition focus:border-primary"
                        required
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-text-primary">
                      <span>Ảnh minh họa</span>
                      <input
                        value={draft.images.join(', ')}
                        onChange={(event) => setDraft((current) => ({ ...current, images: parseImages(event.target.value) }))}
                        className="h-11 w-full rounded-2xl border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
                      />
                    </label>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-bg-base px-4 text-sm font-semibold text-text-primary"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="font-semibold text-text-primary">{review.userName ?? 'Khách hàng'}</span>
                          <span>•</span>
                          <span>{review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">{renderStars(review.rating)}</div>
                        <h3 className="mt-3 text-lg font-semibold text-text-primary">{review.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleHelpful(review.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-primary hover:text-primary"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Hữu ích ({review.helpfulCount})
                        </button>
                        {(review.canEdit || review.canDelete) ? (
                          <div className="flex items-center gap-2">
                            {review.canEdit ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(review.id);
                                  setDraft({
                                    rating: review.rating,
                                    title: review.title,
                                    content: review.content,
                                    images: review.images ?? [],
                                  });
                                }}
                                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-elevated px-3 py-2 text-sm font-medium text-text-primary transition hover:border-primary hover:text-primary"
                              >
                                <PencilLine className="h-4 w-4" />
                                Sửa
                              </button>
                            ) : null}
                            {review.canDelete ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(review.id)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-elevated px-3 py-2 text-sm font-medium text-danger transition hover:border-danger hover:bg-danger/5"
                              >
                                <Trash2 className="h-4 w-4" />
                                Xóa
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-text-secondary">{review.content}</p>

                    {review.images && review.images.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {review.images.map((image) => (
                          <img key={image} src={image} alt={review.title} className="h-20 w-20 rounded-2xl border border-border object-cover" />
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-bg-base p-8 text-center text-sm text-text-secondary">
            Chưa có đánh giá cho sản phẩm này.
          </div>
        )}
      </div>
    </section>
  );
}
