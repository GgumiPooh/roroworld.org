export type PageResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export function createPageResponse<T>(
  content: T[],
  totalElements: number,
  page: number,
  size: number,
): PageResponse<T> {
  const safeSize = Math.max(size, 1);
  const totalPages = Math.ceil(totalElements / safeSize);

  return {
    content,
    empty: content.length === 0,
    first: page === 0,
    last: page >= totalPages - 1 || totalPages === 0,
    number: page,
    size: safeSize,
    totalElements,
    totalPages,
  };
}
