"use client";

import { cn } from "@/shared/lib";
import Link from "next/link";
import { useMemo } from "react";
import { useAlbumDetail } from "../api/useAlbumDetail";

export type AlbumTrackListProps = {
  className?: string;
  albumId: number | string;
};

export function AlbumTrackList({ className, albumId }: AlbumTrackListProps) {
  const { detailView } = useAlbumDetail(albumId);

  const sortedSongs = useMemo(() => {
    return [...(detailView?.songsView ?? [])].sort(
      (a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0),
    );
  }, [detailView?.songsView]);

  return (
    <div className={cn("w-full", className)}>
      <ul className="divide-y divide-plum-300/30">
        {sortedSongs.map((song) => (
          <li key={song.trackNumber} className="py-5">
            <div className="flex">
              <Link
                className="flex w-full items-center justify-start text-start text-2xl text-plum-100"
                href={`/album/${albumId}/song/${song.trackNumber}`}
              >
                <span className="pr-5 text-2xl font-medium text-plum-500">{song.trackNumber}</span>
                {song.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
