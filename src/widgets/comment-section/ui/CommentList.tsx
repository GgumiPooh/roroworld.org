"use client";

import { type Comment, useComments } from "@/entities/comment";
import { useCurrentUser } from "@/entities/user";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { type Ref, useImperativeHandle } from "react";

export type CommentListHandle = {
  addComment: (comment: Comment) => void;
  refresh: () => void;
};

export type CommentListProps = {
  ref?: Ref<CommentListHandle>;
  className?: string;
  albumId?: number | string;
  deleteEndpoint?: (id: number) => string;
  emptyMessage?: string;
  fetchEndpoint?: string;
  showHeader?: boolean;
  trackNumber?: number | string;
};

export function CommentList({
  ref,
  className,
  albumId,
  deleteEndpoint,
  emptyMessage = "아직 댓글이 없습니다. 첫 댓글을 남겨보세요!",
  fetchEndpoint,
  showHeader = true,
  trackNumber,
}: CommentListProps) {
  const { displayName } = useCurrentUser();

  const finalFetchEndpoint =
    fetchEndpoint ?? `/api/public/album/${albumId}/song/${trackNumber}/comments`;
  const finalDeleteEndpoint = deleteEndpoint ?? ((id: number) => `/api/public/album/comment/${id}`);

  const { addComment, comments, deleteComment, error, isLoading, isOwnComment, refresh } =
    useComments({
      currentUserDisplayName: displayName,
      deleteEndpoint: finalDeleteEndpoint,
      fetchEndpoint: finalFetchEndpoint,
    });

  useImperativeHandle(ref, () => ({
    addComment,
    refresh,
  }));

  return (
    <section className={className}>
      {isLoading ? (
        <p className="text-center text-sm text-[#b2b2adb9]">로딩중...</p>
      ) : error ? (
        <p className="text-center text-sm text-[#b2b2adb9]">{error}</p>
      ) : (
        <>
          {showHeader && (
            <h3 className="mb-4 text-lg font-semibold text-plum-100">
              댓글 <span className="text-plum-400">({comments.length})</span>
            </h3>
          )}
          {comments.length === 0 ? (
            <p className="text-center text-sm text-[#b2b2adb9]">{emptyMessage}</p>
          ) : (
            <ul className="mb-50 flex w-full flex-col gap-5">
              {comments.map((commentItem) => {
                const authorDisplay = commentItem.authorName || commentItem.author || "익명";
                const isOwn = isOwnComment(authorDisplay);
                return (
                  <li
                    key={commentItem.id}
                    className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "relative w-full rounded-2xl bg-plum-300/20 px-4 py-3",
                        isOwn ? "rounded-br-none" : "rounded-bl-none",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[#faf8e1] md:text-base">
                            {authorDisplay}
                          </span>
                          <span className="text-xs text-plum-100/90">{commentItem.createdAt}</span>
                        </div>
                        {isOwn && (
                          <Button
                            className="hover:text-red-400/80 h-8 w-8 text-[#faf8e1]"
                            size="sm"
                            variant="icon"
                            onClick={() => deleteComment(commentItem.id)}
                          >
                            <XMarkIcon className="size-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-base leading-relaxed font-medium text-[#faf8e1] md:text-lg">
                        {commentItem.content}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
