import axiosClient from '@/lib/axiosClient'
import type { ApiResponse } from '@/types/auth'

const USERS_API_BASE = '/api/v1/users'

export interface UserRecord {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatarUrl?: string
  phone?: string
  dob?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  onBoarded?: boolean
  active?: boolean
  role?: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface UsersPageResult {
  content: UserRecord[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasMore: boolean
}

export interface UserListFilters {
  email?: string
  phone?: string
  active?: boolean
  role?: string
}

export interface AdminUserCreatePayload {
  email: string
  username: string
  firstName: string
  lastName: string
  avatarUrl?: string
  phone?: string
  role?: string
  password: string
  temporaryPassword?: boolean
  enabled?: boolean
  emailVerified?: boolean
  onBoarded?: boolean
}

export interface AdminUserUpdatePayload {
  email?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  phone?: string
  role?: string
  onBoarded?: boolean
  dob?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
}

export async function getUsers(page = 1, size = 10, filters: UserListFilters = {}): Promise<UsersPageResult> {
  const { data } = await axiosClient.get<ApiResponse<UsersPageResult>>(USERS_API_BASE, {
    params: {
      page,
      size,
      email: filters.email,
      phone: filters.phone,
      active: filters.active,
      role: filters.role,
    },
  })

  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Khong the tai danh sach user')
  }

  return data.result
}

export async function createAdminUser(payload: AdminUserCreatePayload): Promise<UserRecord> {
  const { data } = await axiosClient.post<ApiResponse<UserRecord>>(USERS_API_BASE, payload)
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Khong the tao user')
  }
  return data.result
}

export async function getUser(userId: string): Promise<UserRecord> {
  const { data } = await axiosClient.get<ApiResponse<UserRecord>>(`${USERS_API_BASE}/${userId}`)
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Khong the tai thong tin user')
  }
  return data.result
}

export async function updateUser(userId: string, payload: AdminUserUpdatePayload): Promise<UserRecord> {
  const { data } = await axiosClient.put<ApiResponse<UserRecord>>(`${USERS_API_BASE}/${userId}`, payload)
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Khong the cap nhat user')
  }
  return data.result
}

export async function deleteUser(userId: string): Promise<void> {
  const { data } = await axiosClient.delete<ApiResponse<void>>(`${USERS_API_BASE}/${userId}`)
  if (data.code !== 1000) {
    throw new Error(data.message || 'Khong the xoa user')
  }
}

export async function disableUser(userId: string): Promise<void> {
  const { data } = await axiosClient.put<ApiResponse<void>>(`${USERS_API_BASE}/${userId}/disable`)
  if (data.code !== 1000) {
    throw new Error(data.message || 'Khong the disable user')
  }
}

export async function enableUser(userId: string): Promise<void> {
  const { data } = await axiosClient.put<ApiResponse<void>>(`${USERS_API_BASE}/${userId}/enable`)
  if (data.code !== 1000) {
    throw new Error(data.message || 'Khong the enable user')
  }
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  const { data } = await axiosClient.post<ApiResponse<void>>(`${USERS_API_BASE}/me/change-password`, payload)
  if (data.code !== 1000) {
    throw new Error(data.message || 'Khong the doi mat khau')
  }
}
