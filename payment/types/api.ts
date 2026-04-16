/** Shared backend response wrapper */
export interface ApiResponse<T> {
  code: number;
  result?: T;
  message?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
