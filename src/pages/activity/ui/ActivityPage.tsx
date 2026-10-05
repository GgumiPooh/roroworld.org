"use client";

import { ActivityCard, type Sort, useActivities } from "@/entities/activity";
import { cn } from "@/shared/lib";
import { Skeleton } from "@/shared/ui";
import { ActivityControls } from "@/widgets/activity-controls";
import { useEffect, useRef, useState } from "react";

export type ActivityPageProps = {
  className?: string;
};

export function ActivityPage({ className }: ActivityPageProps) {
  const [sort, setSort] = useState<Sort>("latest");
  const [year, setYear] = useState<string>("");

  const { activities, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useActivities(
    sort,
    year,
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={cn("relative scrollbar-hide h-dvh overflow-y-auto pt-50", className)}>
      <h1 className="mb-50 text-center text-5xl font-bold text-[#faf8e1] md:mb-70 md:text-8xl">
        Activity
      </h1>

      <div className="z-2 mx-auto w-full max-w-[750px] overflow-x-hidden px-4">
        <ActivityControls
          className="mb-15 ml-10 gap-15 md:mb-25 md:ml-40 md:gap-20"
          sort={sort}
          year={year}
          onSortChange={setSort}
          onYearChange={setYear}
        />

        {isLoading ? (
          <div className="ml-6 space-y-12 md:ml-10">
            <Skeleton className="h-28 w-full rounded-2xl bg-gray-500/20" />
            <Skeleton className="h-28 w-full rounded-2xl bg-gray-500/20" />
            <Skeleton className="h-28 w-full rounded-2xl bg-gray-500/20" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-20 text-center text-[#faf8e1]">활동 기록이 없습니다.</div>
        ) : (
          <ul className="relative ml-6 border-l-6 border-gray-600/40 md:ml-10">
            {activities.map((activityItem) => (
              <ActivityCard
                key={activityItem.id}
                className="mb-40 w-full max-w-[660px]"
                activity={activityItem}
              />
            ))}
          </ul>
        )}

        <div ref={loadMoreRef} className="h-10" />

        {isFetchingNextPage && (
          <div className="py-10 text-center text-[#faf8e1]">더 불러오는 중...</div>
        )}

        {!hasNextPage && activities.length > 0 && (
          <div className="py-10 text-center text-[#faf8e1]">모든 활동을 불러왔습니다</div>
        )}
      </div>
    </div>
  );
}
