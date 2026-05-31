import axiosClient from '@/lib/axios-client';
import { getApiErrorMessage } from '@/features/auth/services/auth-api';

type AvatarUploadApiResponse = {
  code?: number;
  message?: string;
  result?: {
    url?: string;
  };
};

export async function uploadUserAvatar(userId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await axiosClient.post<AvatarUploadApiResponse>(
      `/api/v1/users/${encodeURIComponent(userId)}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (data.code !== 1000 || !data.result?.url) {
      throw new Error(data.message || 'Không thể tải avatar lên');
    }

    return data.result.url;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Không thể tải avatar lên'));
  }
}
