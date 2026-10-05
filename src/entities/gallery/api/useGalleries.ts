"use client";

import { type Nullable } from "@/shared/lib";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { type GalleryItem, type GalleryPageResponse } from "../model/types";

export type UseGalleriesConfig = {
  autoFetch?: boolean;
  pageSize?: number;
};

export function useGalleries(config: UseGalleriesConfig = {}) {
  const { autoFetch = true, pageSize = 6 } = config;

  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [accumulated, setAccumulated] = useState<GalleryItem[]>([]);

  const queryKey = keyword
    ? ["galleries", "search", keyword, page, pageSize]
    : ["galleries", "list", page, pageSize];

  const query = useQuery({
    enabled: autoFetch,
    queryFn: async (): Promise<GalleryPageResponse> => {
      const endpoint = keyword
        ? `/api/public/gallery/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${pageSize}`
        : `/api/public/gallery?page=${page}&size=${pageSize}`;

      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch galleries");
      }
      return res.json();
    },
    queryKey,
  });

  const searchGalleries = useCallback((searchKeyword: string) => {
    setKeyword(searchKeyword);
    setPage(0);
    setAccumulated([]);
  }, []);

  const loadMore = useCallback(() => {
    if (!query.isLoading && query.data && !query.data.last) {
      if (query.data.content) {
        setAccumulated((prev) => [...prev, ...query.data.content]);
      }
      setPage((prev) => prev + 1);
    }
  }, [query.data, query.isLoading]);

  const refresh = useCallback(() => {
    setKeyword("");
    setPage(0);
    setAccumulated([]);
    query.refetch();
  }, [query]);

  const queryContent = query.data?.content ?? [];
  const galleries = [
    ...accumulated,
    ...queryContent.filter((item) => !accumulated.some((acc) => acc.id === item.id)),
  ];

  return {
    error: (query.error ? "게시물을 불러오는데 실패했습니다." : null) as Nullable<string>,
    galleries,
    hasMore: query.data ? !query.data.last : false,
    isLoading: query.isLoading,
    loadMore,
    refresh,
    search: searchGalleries,
    totalElements: query.data?.totalElements ?? 0,
  };
}
