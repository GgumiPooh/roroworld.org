"use client";

import { AlbumTrackList, useAlbums } from "@/entities/album";
import { cn } from "@/shared/lib";
import { BlurBackground, Button, ImageWithPlaceholder, Skeleton } from "@/shared/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useState } from "react";

export type AlbumDetailPageProps = {
  className?: string;
  albumId: number | string;
};

export function AlbumDetailPage({ className, albumId }: AlbumDetailPageProps) {
  const { albumsView, isLoading } = useAlbums();
  const [showDescription, setShowDescription] = useState(false);

  const album = useMemo(
    () => albumsView.find((albumItem) => String(albumItem.id) === String(albumId)),
    [albumsView, albumId],
  );

  return (
    <div className={cn("relative overflow-y-auto pt-30 md:pt-50", className)}>
      <BlurBackground
        imgClassName="scale-105 blur-md"
        alt={album?.titleText}
        src={album?.coverUrl}
      />
      <div className="fixed inset-0 -z-1 bg-gray-800/60" />

      <div className="z-2 mx-auto w-[min(92vw,900px)]">
        <div className="relative mx-5 mb-10">
          <Link className="mb-10 inline-flex text-sm text-plum-200" href="/albums">
            <ArrowLeftIcon className="size-5 text-plum-100" />
          </Link>

          {isLoading ? (
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-end lg:gap-20">
              <Skeleton className="h-60 w-60 rounded-xl bg-plum-800/40 sm:h-70 sm:w-70 md:h-75 md:w-75 lg:h-85 lg:w-85" />
              <div className="flex w-full flex-col gap-4">
                <Skeleton className="h-10 w-2/3 rounded-lg bg-plum-800/40" />
                <Skeleton className="h-6 w-1/3 rounded-lg bg-plum-800/40" />
              </div>
            </div>
          ) : !album ? (
            <p className="py-20 text-center text-plum-100/80">앨범을 찾을 수 없습니다.</p>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-end lg:gap-20">
              <ImageWithPlaceholder
                className="h-60 w-60 shrink-0 object-cover shadow-md sm:h-70 sm:w-70 md:h-75 md:w-75 lg:h-85 lg:w-85"
                alt={album.titleText}
                src={album.coverUrl}
              />
              <div className="flex flex-col items-center gap-2 md:items-start">
                <h1 className="text-2xl font-bold text-plum-100 sm:text-3xl md:text-4xl">
                  {album.titleText}
                </h1>
                {album.publishedAt && (
                  <p className="text-sm text-plum-300/80 md:text-base">
                    {album.publishedAt.replaceAll("-", ".")}
                  </p>
                )}
                {album.descriptionText && (
                  <>
                    <Button
                      className="ml-6 self-start p-0 text-plum-300 md:ml-0"
                      size="sm"
                      variant="icon"
                      onClick={() => setShowDescription((prev) => !prev)}
                    >
                      {showDescription ? (
                        <span className="font-bold">▲</span>
                      ) : (
                        <span className="font-bold">▼ 앨범소개</span>
                      )}
                    </Button>
                    <div
                      className={cn(
                        "overflow-hidden text-xs whitespace-pre-wrap text-plum-200/80 transition-all duration-400 ease-in-out md:text-base",
                        showDescription ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                      )}
                    >
                      {album.descriptionText}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mx-5 mb-10 text-sm md:text-base">
          <AlbumTrackList albumId={albumId} />
        </div>
      </div>
    </div>
  );
}
