"use client";

import { AlbumCard, useAlbums } from "@/entities/album";
import { cn } from "@/shared/lib";
import { Skeleton } from "@/shared/ui";
import { type AlbumSort, SortOptions, YearFilter } from "@/widgets/album-controls";
import { useMemo, useState } from "react";

export type AlbumsPageProps = {
  className?: string;
};

export function AlbumsPage({ className }: AlbumsPageProps) {
  const [sort, setSort] = useState<AlbumSort>("latest");
  const [year, setYear] = useState<string>("");

  const { albumsView, error, isLoading } = useAlbums();

  const filteredAlbums = useMemo(() => {
    let result = [...albumsView];

    if (year) {
      result = result.filter((album) => album.publishedAt?.startsWith(year));
    }

    result.sort((a, b) => {
      const dateA = a.publishedAt ?? "";
      const dateB = b.publishedAt ?? "";
      return sort === "latest" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    });

    return result;
  }, [albumsView, sort, year]);

  return (
    <div className={cn("relative scrollbar-hide h-dvh overflow-y-auto pt-50", className)}>
      <h1 className="mb-35 text-center text-5xl font-bold text-[#faf8e1] md:mb-60 md:text-8xl">
        Albums
      </h1>

      <div className="z-2 mx-auto w-[min(92vw,760px)] px-5.5">
        <div className="mb-10 flex items-center justify-between gap-4">
          <YearFilter year={year} onChange={setYear} />
          <SortOptions sort={sort} onChange={setSort} />
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl bg-gray-900/40" />
            <Skeleton className="h-32 w-full rounded-xl bg-gray-900/40" />
            <Skeleton className="h-32 w-full rounded-xl bg-gray-900/40" />
          </div>
        ) : error ? (
          <p className="text-red-200 mb-20 text-center">앨범 목록을 불러오는데 실패했습니다.</p>
        ) : filteredAlbums.length === 0 ? (
          <p className="py-20 text-center text-plum-100/80">앨범이 없습니다.</p>
        ) : (
          <ul className="w-full">
            {filteredAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
