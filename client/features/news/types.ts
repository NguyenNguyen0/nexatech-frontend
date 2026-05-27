export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface NewsListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  isPublic: boolean;
  status: NewsStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface NewsImageAsset {
  id: string;
  publicId: string;
  url: string;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  mimeType?: string | null;
  status?: string | null;
}

export interface NewsDetail extends NewsListItem {
  contentJson?: unknown;
  contentHtml: string;
  images?: NewsImageAsset[];
}
