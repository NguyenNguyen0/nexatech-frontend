import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axios-client';
import { unwrapProductApiResponse } from '../utils';
import type { ProductReview, ReviewUpdateBody, ReviewWriteBody } from '../types';

export interface ReviewMediaUploadResult {
  url: string;
  key: string;
  mediaType: 'image' | 'video';
  contentType: string;
  size: number;
}

type ProductApiErrorPayload = {
  message?: string;
  success?: boolean;
  code?: number;
};

export function getReviewErrorMessage(error: unknown, fallback = 'Không thể thực hiện thao tác đánh giá'): string {
  if (!isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const data = error.response?.data as ProductApiErrorPayload | undefined;
  if (data?.message?.trim()) {
    return data.message.trim();
  }

  return error.message || fallback;
}

async function mutateReview(path: string, method: 'post' | 'put' | 'delete', body?: ReviewWriteBody | ReviewUpdateBody): Promise<void> {
  try {
    const response = await axiosClient.request<unknown>({
      url: path,
      method,
      data: body,
    });

    unwrapProductApiResponse<unknown>(response.data);
  } catch (error) {
    throw new Error(getReviewErrorMessage(error));
  }
}

export async function fetchMyProductReview(productId: string): Promise<ProductReview | null> {
  try {
    const response = await axiosClient.get<unknown>(`/api/v1/products/${encodeURIComponent(productId)}/reviews/mine`);
    return unwrapProductApiResponse<ProductReview>(response.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(getReviewErrorMessage(error, 'Không thể tải đánh giá của bạn'));
  }
}

export async function createProductReview(productId: string, body: ReviewWriteBody): Promise<void> {
  await mutateReview(`/api/v1/products/${encodeURIComponent(productId)}/reviews`, 'post', body);
}

export async function uploadReviewMedia(productId: string, file: File): Promise<ReviewMediaUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosClient.post<unknown>(
      `/api/v1/products/${encodeURIComponent(productId)}/reviews/media`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return unwrapProductApiResponse<ReviewMediaUploadResult>(response.data);
  } catch (error) {
    throw new Error(getReviewErrorMessage(error, 'Không thể tải media lên'));
  }
}

export async function updateProductReview(reviewId: string, body: ReviewUpdateBody): Promise<void> {
  await mutateReview(`/api/v1/reviews/${encodeURIComponent(reviewId)}`, 'put', body);
}

export async function deleteProductReview(reviewId: string): Promise<void> {
  await mutateReview(`/api/v1/reviews/${encodeURIComponent(reviewId)}`, 'delete');
}

export async function markReviewHelpful(reviewId: string): Promise<void> {
  await mutateReview(`/api/v1/reviews/${encodeURIComponent(reviewId)}/helpful`, 'post');
}
