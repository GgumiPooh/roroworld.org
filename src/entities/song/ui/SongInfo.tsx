"use client";

import { cn, type Nullable } from "@/shared/lib";
import { Button, ImageWithPlaceholder } from "@/shared/ui";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useParams } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import { useSong } from "../api/useSong";

export type SongInfoProps = {
  className?: string;
  albumCoverUrl?: string;
  albumId?: number | string;
  commentInputSlot?: ReactNode;
  commentSlot?: ReactNode;
  isPlaying?: boolean;
  playButtonSlot?: ReactNode;
  trackNumber?: number | string;
  onTogglePlay?: (youtubeId: string) => void;
};

const YOUTUBE_URL_PATTERNS = [
  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
];

export function extractYouTubeId(url?: string): Nullable<string> {
  if (!url) {
    return null;
  }
  return (
    YOUTUBE_URL_PATTERNS.map((pattern) => url.match(pattern)?.[1]).find((videoId) =>
      Boolean(videoId),
    ) ?? null
  );
}

export function SongInfo({
  className,
  albumCoverUrl,
  albumId: propAlbumId,
  commentInputSlot,
  commentSlot,
  isPlaying = false,
  playButtonSlot,
  trackNumber: propTrackNumber,
  onTogglePlay,
}: SongInfoProps) {
  const params = useParams();
  const albumId = propAlbumId ?? (params?.albumId as string | undefined);
  const trackNumber = propTrackNumber ?? (params?.trackNumber as string | undefined);

  const { detailView, error, isLoading } = useSong(albumId, trackNumber);
  const [showLyrics, setShowLyrics] = useState(false);

  const youtubeId = useMemo(() => extractYouTubeId(detailView?.videoUrl), [detailView?.videoUrl]);

  return (
    <div className={cn("mx-auto mb-20 w-[min(92vw,1000px)] px-5 md:px-0", className)}>
      {isLoading ? (
        <p className="text-center font-bold text-plum-300/80">로로로로디중...</p>
      ) : error ? (
        <p className="text-red-200 text-center">Failed to load song detail: {error.message}</p>
      ) : !detailView ? null : (
        <>
          <div className="mb-5 flex flex-col items-center gap-6 md:justify-center md:gap-10 lg:flex-row">
            <ImageWithPlaceholder
              className="h-[250px] w-[250px] shrink-0 shadow-[0_15px_35px_rgba(0,0,0,0.35)] md:h-[320px] md:w-[320px] lg:h-[350px] lg:w-[350px]"
              imgClassName="h-full w-full object-cover"
              alt="album cover"
              src={detailView.imgUrl || albumCoverUrl || "/images/placeholder.png"}
            />

            <div className="flex flex-col items-center text-center">
              <div className="mb-10 flex items-center gap-5">
                <h2 className="text-2xl font-bold text-plum-200 md:text-4xl">{detailView.title}</h2>
                {playButtonSlot ? (
                  playButtonSlot
                ) : youtubeId && onTogglePlay ? (
                  <Button
                    className="mb-1 rounded-full bg-plum-600 hover:bg-plum-500 md:h-8.5 md:w-8.5"
                    size="sm"
                    variant="icon"
                    onClick={() => onTogglePlay(youtubeId)}
                  >
                    {isPlaying ? (
                      <PauseIcon className="size-5 text-plum-100" />
                    ) : (
                      <PlayIcon className="size-5 text-plum-100" />
                    )}
                  </Button>
                ) : null}
              </div>
              {detailView.description && (
                <p className="max-w-[50ch] text-sm leading-loose whitespace-pre-wrap text-plum-200/90 italic md:text-base">
                  {detailView.description}
                </p>
              )}
            </div>
          </div>

          {detailView.lyrics && (
            <div className="flex flex-col items-start">
              <Button
                className="mb-4 pl-10 text-sm text-plum-200"
                size="sm"
                variant="icon"
                onClick={() => setShowLyrics((prev) => !prev)}
              >
                {showLyrics ? "▲ 가사" : "▼ 가사"}
              </Button>

              <div
                className={cn(
                  "ml-10 overflow-hidden text-sm leading-relaxed whitespace-pre-wrap text-plum-200/90 transition-all duration-500 ease-in-out md:text-base",
                  showLyrics ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
                )}
              >
                {detailView.lyrics}
              </div>
            </div>
          )}

          {commentSlot}
          {commentInputSlot}
        </>
      )}
    </div>
  );
}
