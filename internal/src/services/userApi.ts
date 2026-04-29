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

export async function getUsers(page = 1, size = 10): Promise<UsersPageResult> {
  const { data } = await axiosClient.get<ApiResponse<UsersPageResult>>(USERS_API_BASE, {
    params: { page, size },
  })

  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Khong the tai danh sach user')
  }

  return data.result
}
