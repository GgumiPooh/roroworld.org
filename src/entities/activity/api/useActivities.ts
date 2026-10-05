"use client";

import { A_MINUTE, assert } from "@/shared/lib";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type Activity, type Sort } from "../model/types";

type PageResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ActivitiesPage = {
  activities: Activity[];
  nextPage: number | undefined;
  totalPages: number;
};

async function fetchActivities(
  sort: Sort,
  year: string,
  page = 0,
  size = 4,
): Promise<ActivitiesPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });

  if (year) {
    params.set("year", year);
  }

  const res = await fetch(`/api/public/activity?${params}`, {
    credentials: "include",
  });

  assert(res.ok, "Failed to fetch activities");

  const pageResponse = (await res.json()) as PageResponse<Activity>;
  const activities = (pageResponse.content ?? []).map((item) => ({
    activeFrom: item.activeFrom,
    activeTo: item.activeTo,
    activityType: item.activityType,
    description: item.description,
    id: item.id,
    metaData: item.metaData || item.metadata || [],
    metadata: item.metadata || item.metaData || [],
    title: item.title ?? [],
  }));

  const currentPage = pageResponse.number;
  const totalPages = pageResponse.totalPages;

  return {
    activities,
    nextPage: currentPage + 1 < totalPages ? currentPage + 1 : undefined,
    totalPages,
  };
}

export function useActivities(sort: Sort, year: string) {
  const query = useInfiniteQuery({
    getNextPageParam: (lastPage: ActivitiesPage) => lastPage.nextPage,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchActivities(sort, year, pageParam),
    queryKey: ["activities", sort, year],
    staleTime: A_MINUTE,
  });

  const activities = query.data?.pages.flatMap((page: ActivitiesPage) => page.activities) ?? [];

  return {
    activities,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
  };
}
