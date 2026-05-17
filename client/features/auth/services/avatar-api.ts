/**
 * Stub — upload avatar qua storage-service (chưa triển khai).
 *
 * Khi storage sẵn sàng:
 * 1. POST file → storage → nhận `url`
 * 2. PUT /api/v1/users/{userId} với `{ avatarUrl: url }`
 */
export async function uploadUserAvatar(_userId: string, _file: File): Promise<string> {
  throw new Error('Storage service chưa sẵn sàng — chưa thể upload avatar');
}
