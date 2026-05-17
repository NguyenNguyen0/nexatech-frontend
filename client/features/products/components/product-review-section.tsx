'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Star, ThumbsUp, PencilLine, Trash2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { fetchProductReviews } from '../services/products-api';
import { createProductReview, deleteProductReview, markReviewHelpful, updateProductReview } from '../services/reviews-api';
import type { ProductReview, ReviewWriteBody } from '../types';

interface ProductReviewSectionProps {
  productId: string;
  productSlug?: string;
  productName: string;
  averageRating?: number;
  reviewCount?: number;
  initialReviews: ProductReview[];
  initialHasNext?: boolean;
}

type RatingFilter = 'ALL' | 5 | 4 | 3 | 2 | 1;

const PAGE_SIZE = 10;

const initialFormState: ReviewWriteBody = {
  rating: 5,
  title: '',
  content: '',
  images: [],
};

function renderStars(rating: number) {
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
  productSlug,
  productName,
  averageRating,
  reviewCount,
  initialReviews,
  initialHasNext,
}: ProductReviewSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewWriteBody>(initialFormState);
  const [activeRating, setActiveRating] = useState<RatingFilter>('ALL');
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(Boolean(initialHasNext));
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setHasAccessToken(Boolean(authStorage.getAccessToken()));
  }, []);

  useEffect(() => {
    const ratingValue = Number(searchParams.get('rating'));
    if ([1, 2, 3, 4, 5].includes(ratingValue)) {
      setActiveRating(ratingValue as RatingFilter);
      return;
    }
    setActiveRating('ALL');
  }, [searchParams]);

  useEffect(() => {
    setReviews(initialReviews);
    setPage(1);
    setHasNext(Boolean(initialHasNext));
  }, [initialHasNext, initialReviews, productId]);

  const totalReviews = reviewCount ?? initialReviews.length;
  const ratingValue = typeof averageRating === 'number' ? averageRating : 0;

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((left, right) => {
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightDate - leftDate;
    });
  }, [reviews]);

  const loadReviews = async (nextPage: number, mode: 'replace' | 'append') => {
    const targetRating = activeRating === 'ALL' ? undefined : activeRating;

    if (mode === 'append') {
      setLoadingMore(true);
    } else {
      setLoadingReviews(true);
    }

    try {
      const result = await fetchProductReviews(
        productSlug ?? productId,
        { page: nextPage, size: PAGE_SIZE, rating: targetRating },
        productId,
      );

      setReviews((current) => (mode === 'append' ? [...current, ...result.items] : result.items));
      setPage(result.page ?? nextPage);

      const derivedHasNext =
        typeof result.hasNext === 'boolean'
          ? result.hasNext
          : typeof result.totalPages === 'number'
            ? (result.page ?? nextPage) < result.totalPages
            : result.items.length >= PAGE_SIZE;

      setHasNext(derivedHasNext);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải đánh giá');
    } finally {
      setLoadingReviews(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (activeRating === 'ALL') {
      setReviews(initialReviews);
      setPage(1);
      setHasNext(Boolean(initialHasNext));
      return;
    }

    void loadReviews(1, 'replace');
  }, [activeRating]);

  const applyRatingFilter = (rating: RatingFilter) => {
    setActiveRating(rating);

    const nextQuery = new URLSearchParams(searchParams.toString());
    if (rating === 'ALL') {
      nextQuery.delete('rating');
    } else {
      nextQuery.set('rating', String(rating));
    }

    const query = nextQuery.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const reloadCurrentFilter = async () => {
    if (activeRating === 'ALL') {
      router.refresh();
      return;
    }

    await loadReviews(1, 'replace');
  };

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
      await reloadCurrentFilter();
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
    if (!hasAccessToken) {
      toast.error('Vui lòng đăng nhập để xóa đánh giá');
      return;
    }

    if (!window.confirm('Xóa đánh giá này?')) return;

    try {
      await deleteProductReview(reviewId);
      toast.success('Đã xóa đánh giá');
      await reloadCurrentFilter();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa đánh giá');
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>, reviewId: string) => {
    event.preventDefault();

    if (!hasAccessToken) {
      toast.error('Vui lòng đăng nhập để sửa đánh giá');
      return;
    }

    try {
      await updateProductReview(reviewId, draft);
      toast.success('Đã cập nhật đánh giá');
      setEditingId(null);
      await reloadCurrentFilter();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật đánh giá');
    }
  };

  return (
    <section className="bg-surface rounded-md p-6 md:p-8 border border-outline-variant">
      <div className="flex flex-col gap-5 border-b border-outline-variant pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-label-sm font-bold uppercase tracking-wider text-primary">Đánh giá sản phẩm</p>
          <h2 className="mt-2 text-headline-sm font-headline-sm text-on-surface">{productName}</h2>
          <div className="mt-3 flex items-center gap-3 text-body-md text-on-surface-variant">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1">{renderStars(ratingValue)}</span>
              <strong className="text-on-surface">{ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}</strong>
            </span>
            <span>{totalReviews} đánh giá</span>
          </div>
        </div>

        {hasAccessToken ? (
          <div className="rounded bg-surface-container-low border border-outline-variant px-4 py-3 text-label-sm text-on-surface-variant">
            Bạn có thể gửi đánh giá mới hoặc chỉnh sửa đánh giá đã tạo.
          </div>
        ) : (
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-md border border-outline-variant bg-surface px-4 py-3 text-label-sm font-bold text-primary transition hover:bg-surface-container"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập để đánh giá
          </a>
        )}
      </div>

      {hasAccessToken ? (
        <form onSubmit={handleCreateReview} className="mt-6 grid gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-5">
          <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
            <label className="space-y-2 text-label-sm font-medium text-on-surface">
              <span>Chấm điểm</span>
              <select
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                className="h-11 w-full rounded border border-outline-variant bg-surface px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} sao
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-label-sm font-medium text-on-surface">
              <span>Tiêu đề</span>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Sản phẩm tốt, đóng gói chắc chắn..."
                className="h-11 w-full rounded border border-outline-variant bg-surface px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
                required
              />
            </label>
          </div>

          <label className="space-y-2 text-label-sm font-medium text-on-surface">
            <span>Nội dung</span>
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              className="w-full rounded border border-outline-variant bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
              required
            />
          </label>

          <label className="space-y-2 text-label-sm font-medium text-on-surface">
            <span>Ảnh minh họa</span>
            <input
              value={form.images.join(', ')}
              onChange={(event) => setForm((current) => ({ ...current, images: parseImages(event.target.value) }))}
              placeholder="https://... , https://..."
              className="h-11 w-full rounded border border-outline-variant bg-surface px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
            />
          </label>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-label-sm font-bold text-on-primary transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(['ALL', 5, 4, 3, 2, 1] as const).map((rating) => {
          const selected = activeRating === rating;
          const label = rating === 'ALL' ? 'Tất cả' : `${rating}★`;

          return (
            <button
              key={String(rating)}
              type="button"
              onClick={() => applyRatingFilter(rating)}
              className={`inline-flex h-9 items-center justify-center rounded-sm border px-4 text-label-sm font-bold transition ${
                selected
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        {loadingReviews ? (
          <div className="rounded border border-dashed border-outline-variant bg-surface p-8 text-center text-body-md text-on-surface-variant">
            Đang tải đánh giá...
          </div>
        ) : sortedReviews.length > 0 ? (
          sortedReviews.map((review) => {
            const isEditing = editingId === review.id;

            return (
              <article key={review.id} className="rounded-md border border-outline-variant bg-surface p-5">
                {isEditing ? (
                  <form onSubmit={(event) => handleEditSubmit(event, review.id)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                      <label className="space-y-2 text-sm font-medium text-text-primary">
                        <span>Chấm điểm</span>
                        <select
                          value={draft.rating}
                          onChange={(event) => setDraft((current) => ({ ...current, rating: Number(event.target.value) }))}
                          className="h-11 w-full rounded border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
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
                          className="h-11 w-full rounded border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
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
                        className="w-full rounded border border-border bg-bg-elevated px-4 py-3 outline-none transition focus:border-primary"
                        required
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-text-primary">
                      <span>Ảnh minh họa</span>
                      <input
                        value={draft.images.join(', ')}
                        onChange={(event) => setDraft((current) => ({ ...current, images: parseImages(event.target.value) }))}
                          className="h-11 w-full rounded border border-border bg-bg-elevated px-4 outline-none transition focus:border-primary"
                        />
                      </label>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex h-10 items-center justify-center rounded border border-border bg-bg-base px-4 text-sm font-semibold text-text-primary"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                          <span className="font-bold text-on-surface">{review.userName ?? 'Khách hàng'}</span>
                          <span>•</span>
                          <span>{review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">{renderStars(review.rating)}</div>
                        <h3 className="mt-3 text-title-md font-title-md text-on-surface">{review.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleHelpful(review.id)}
                          className="inline-flex items-center gap-2 rounded border border-outline-variant bg-surface px-4 py-2 text-label-sm font-bold text-on-surface transition hover:bg-surface-container"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Hữu ích ({review.helpfulCount})
                        </button>
                        {hasAccessToken && (review.canEdit || review.canDelete) ? (
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
                                className="inline-flex items-center gap-2 rounded border border-outline-variant bg-surface px-3 py-2 text-label-sm font-bold text-on-surface transition hover:bg-surface-container"
                              >
                                <PencilLine className="h-4 w-4" />
                                Sửa
                              </button>
                            ) : null}
                            {review.canDelete ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(review.id)}
                                className="inline-flex items-center gap-2 rounded border border-outline-variant bg-surface px-3 py-2 text-label-sm font-bold text-error transition hover:bg-error/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                Xóa
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-line text-body-md text-on-surface-variant">{review.content}</p>

                    {review.images && review.images.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {review.images.map((image) => (
                          <img key={image} src={image} alt={review.title} className="h-20 w-20 rounded border border-outline-variant object-cover" />
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            );
          })
        ) : (
          <div className="rounded border border-dashed border-outline-variant bg-surface p-8 text-center text-body-md text-on-surface-variant">
            {activeRating === 'ALL' ? 'Chưa có đánh giá cho sản phẩm này.' : `Chưa có đánh giá ${activeRating} sao.`}
          </div>
        )}

        {!loadingReviews && hasNext && sortedReviews.length > 0 ? (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => void loadReviews(page + 1, 'append')}
              disabled={loadingMore}
              className="inline-flex h-11 items-center justify-center rounded-md border border-outline-variant bg-surface px-5 text-label-sm font-bold text-primary transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore ? 'Đang tải...' : 'Tải thêm đánh giá'}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
