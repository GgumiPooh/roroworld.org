"use client";

import { type Comment } from "@/entities/comment";
import { useAuthOverlay } from "@/features/auth";
import { CommentInput } from "@/features/comment";
import { cn } from "@/shared/lib";
import { ImageWithPlaceholder } from "@/shared/ui";
import { CommentList, type CommentListHandle } from "@/widgets/comment-section";
import { useRef } from "react";

export type ToArtistPageProps = {
  className?: string;
};

export function ToArtistPage({ className }: ToArtistPageProps) {
  const commentListRef = useRef<CommentListHandle>(null);
  const { open: openLogin } = useAuthOverlay();

  function handleMessageSubmit(newComment: Comment) {
    commentListRef.current?.addComment(newComment);
  }

  return (
    <div className={cn("relative scrollbar-hide h-dvh overflow-y-auto pt-50", className)}>
      <div className="fixed inset-0 -z-1 bg-gray-900/70" />
      <ImageWithPlaceholder
        className="fixed inset-0 -z-2 h-dvh w-full"
        imgClassName="object-cover object-center backdrop-blur-sm"
        alt="background"
        src="/images/home-banner3.png"
      />

      <div className="mx-auto w-[min(92vw,700px)] px-4 pb-40">
        <h1 className="mb-6 text-center text-4xl font-bold text-[#faf8e1] md:mb-10 md:text-6xl">
          To. RORO
        </h1>

        <CommentList
          ref={commentListRef}
          deleteEndpoint={(id) => `/api/public/message/${id}`}
          emptyMessage="아직 메시지가 없습니다. 첫 메시지를 남겨보세요!"
          fetchEndpoint="/api/public/message"
          showHeader={false}
        />
      </div>

      <CommentInput
        apiEndpoint="/api/public/message"
        placeholder="비방적인 글 작성 시 관리자에 의해 삭제될 수 있습니다."
        onCommentSubmit={handleMessageSubmit}
        onLoginRequested={openLogin}
      />
    </div>
  );
}
