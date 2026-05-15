import axiosClient from '@/lib/axios-client';
import { authPaths, sessionByIdPath } from '@/lib/constants';
import type { ApiResponse } from '@/types/auth';
import type { SessionItem } from '@/types/session';

export async function fetchMySessions(): Promise<SessionItem[]> {
  const { data } = await axiosClient.get<ApiResponse<SessionItem[]>>(authPaths.sessionsMe);
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Không lấy được danh sách phiên đăng nhập');
  }
  return data.result;
}

export async function signOutSession(sessionId: string): Promise<void> {
  await axiosClient.delete<ApiResponse<void>>(sessionByIdPath(sessionId));
}

export async function signOutAllDevices(): Promise<void> {
  await axiosClient.post<ApiResponse<void>>(authPaths.sessionsLogoutAll);
}

export async function pingSession(): Promise<void> {
  await axiosClient.get<ApiResponse<void>>(authPaths.sessionPing);
}
