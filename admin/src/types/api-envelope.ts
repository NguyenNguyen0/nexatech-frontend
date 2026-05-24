export interface ApiEnvelope<T> {
  success?: boolean
  data?: T
  message?: string | null
  timestamp?: string
  code?: number
  result?: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type SortDirection = 'asc' | 'desc'

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string | string[]
}
