import axiosClient from '@/lib/axios-client';
import { unwrapProductApiResponse } from '../utils';
import type { ReviewUpdateBody, ReviewWriteBody } from '../types';

async function mutateReview(path: string, method: 'post' | 'put' | 'delete', body?: ReviewWriteBody | ReviewUpdateBody): Promise<void> {
  const response = await axiosClient.request<unknown>({
    url: path,
    method,
    data: body,
  });

  unwrapProductApiResponse<unknown>(response.data);
}

export async function createProductReview(productId: string, body: ReviewWriteBody): Promise<void> {
  await mutateReview(`/api/v1/products/${encodeURIComponent(productId)}/reviews`, 'post', body);
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
