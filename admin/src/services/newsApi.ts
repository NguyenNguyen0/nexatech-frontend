import axiosClient from '@/lib/axiosClient';
import type { ApiResponse } from '@/types/auth';
import type {
  NewsDetailResponse,
  NewsListResponse,
  NewsResponse,
  NewsVisibilityRequest,
} from '@/types/news.types';

const BASE_URL = '/api/v1/news';

type NewsApiResponse<T> = ApiResponse<T> & { result: T };

export const getAllNews = async (): Promise<NewsApiResponse<NewsListResponse[]>> => {
  const response = await axiosClient.get(BASE_URL);
  return response.data;
};

export const getPublicNews = async (): Promise<NewsApiResponse<NewsListResponse[]>> => {
  const response = await axiosClient.get(`${BASE_URL}/public`);
  return response.data;
};

export const getPublicNewsBySlug = async (
  slug: string
): Promise<NewsApiResponse<NewsDetailResponse>> => {
  const response = await axiosClient.get(`${BASE_URL}/public/${slug}`);
  return response.data;
};

export const getNewsBySlug = async (
  slug: string
): Promise<NewsApiResponse<NewsDetailResponse>> => {
  const response = await axiosClient.get(`${BASE_URL}/${slug}`);
  return response.data;
};

export const updateNewsVisibility = async (
  id: string,
  request: NewsVisibilityRequest
): Promise<NewsApiResponse<NewsResponse>> => {
  const response = await axiosClient.patch(`${BASE_URL}/${id}/visibility`, request);
  return response.data;
};

export const deleteNews = async (id: string): Promise<ApiResponse<void>> => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export interface CreateNewsRequest {
  id?: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: File;
  contentJson: string;
  contentHtml: string;
  isPublic?: boolean;
}

export const createNews = async (
  request: CreateNewsRequest
): Promise<NewsApiResponse<NewsResponse>> => {
  if (request.id) {
    return updateNews(request.id, request);
  }

  const formData = toNewsFormData(request);
  const response = await axiosClient.post(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export interface UpdateNewsRequest {
  title?: string;
  slug?: string;
  description?: string;
  thumbnail?: File;
  contentJson?: string;
  contentHtml?: string;
  isPublic?: boolean;
}

export const updateNews = async (
  id: string,
  request: UpdateNewsRequest
): Promise<NewsApiResponse<NewsResponse>> => {
  const formData = toNewsFormData(request);
  const response = await axiosClient.put(`${BASE_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export interface ImageAssetResponse {
  id: string;
  publicId: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
  ownerType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const uploadNewsImage = async (
  newsId: string,
  file: File
): Promise<NewsApiResponse<ImageAssetResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post(`${BASE_URL}/${newsId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getNewsImages = async (
  newsId: string
): Promise<NewsApiResponse<ImageAssetResponse[]>> => {
  const response = await axiosClient.get(`${BASE_URL}/${newsId}/images`);
  return response.data;
};

export const deleteImageByPublicId = async (
  publicId: string
): Promise<ApiResponse<void>> => {
  const response = await axiosClient.delete(`${BASE_URL}/images/public/${publicId}`);
  return response.data;
};

export const deleteAllNewsImages = async (
  newsId: string
): Promise<ApiResponse<void>> => {
  const response = await axiosClient.delete(`${BASE_URL}/${newsId}/images`);
  return response.data;
};

const toNewsFormData = (request: UpdateNewsRequest) => {
  const formData = new FormData();

  if (request.title !== undefined) formData.append('title', request.title);
  if (request.slug !== undefined) formData.append('slug', request.slug);
  if (request.description !== undefined) {
    formData.append('description', request.description);
  }
  if (request.contentJson !== undefined) {
    formData.append('contentJson', request.contentJson);
  }
  if (request.contentHtml !== undefined) {
    formData.append('contentHtml', request.contentHtml);
  }
  if (request.isPublic !== undefined) {
    formData.append('isPublic', String(request.isPublic));
  }
  if (request.thumbnail) {
    formData.append('thumbnail', request.thumbnail);
  }

  return formData;
};
