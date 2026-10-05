export type GalleryItem = {
  authorId: number | string | null;
  authorName: string;
  commentCount: number;
  createdAt: string;
  description: string | null;
  imageUrls: string[];
  likeCount: number;
  title: string;
  viewCount: number;
  id: number;
};

export type GalleryPageResponse = {
  content: GalleryItem[];
  empty?: boolean;
  first: boolean;
  last: boolean;
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
