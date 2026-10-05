"use client";

import { useAlbums } from "@/entities/album";
import { SongInfo } from "@/entities/song";
import { useAuthOverlay } from "@/features/auth";
import { CommentInput } from "@/features/comment";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { usePageBackground } from "@/widgets/background";
import { CommentList, type CommentListHandle } from "@/widgets/comment-section";
import { useYouTubePlayer } from "@/widgets/youtube-player";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";

export type SongDetailPageProps = {
  className?: string;
  albumId: number | string;
  trackNumber: number | string;
};

export function SongDetailPage({ className, albumId, trackNumber }: SongDetailPageProps) {
  const router = useRouter();
  const { albumsView } = useAlbums();
  const { open: openLogin } = useAuthOverlay();
  const { isPlaying, toggle } = useYouTubePlayer();
  const commentListRef = useRef<CommentListHandle>(null);

  const album = useMemo(
    () => albumsView.find((albumItem) => String(albumItem.id) === String(albumId)),
    [albumsView, albumId],
  );

  usePageBackground({
    alt: album?.titleText,
    src: album?.coverUrl,
  });

  function handleNavigateBack() {
    if (album?.albumType === "DIGITAL_SINGLE") {
      router.push("/albums");
    } else {
      router.push(`/album/${albumId}`);
    }
  }

  return (
    <div className={cn("relative overflow-y-auto pt-40 md:pt-50", className)}>
      <div className="z-2 mx-auto w-[min(92vw,1000px)]">
        <Button
          className="mb-10 pl-10 text-sm text-plum-200"
          size="md"
          variant="icon"
          onClick={handleNavigateBack}
        >
          <ArrowLeftIcon className="size-5 text-plum-100" />
        </Button>

        <SongInfo
          albumCoverUrl={album?.coverUrl}
          albumId={albumId}
          isPlaying={isPlaying}
          trackNumber={trackNumber}
          commentInputSlot={
            <CommentInput
              apiEndpoint={`/api/public/album/${albumId}/song/${trackNumber}/comment`}
              onCommentSubmit={(c) => commentListRef.current?.addComment(c)}
              onLoginRequested={openLogin}
            />
          }
          commentSlot={
            <CommentList ref={commentListRef} albumId={albumId} trackNumber={trackNumber} />
          }
          onTogglePlay={(id) => toggle(id)}
        />
      </div>
    </div>
  );
}
