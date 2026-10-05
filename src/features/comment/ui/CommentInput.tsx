"use client";

import { type Comment } from "@/entities/comment";
import { useCurrentUser } from "@/entities/user";
import { assert, cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { type KeyboardEvent, type MouseEvent, useState } from "react";

export type CommentInputProps = {
  className?: string;
  apiEndpoint: string;
  placeholder?: string;
  onCommentSubmit?: (comment: Comment) => void;
  onLoginRequested?: () => void;
};

export function CommentInput({
  className,
  apiEndpoint,
  placeholder = "댓글을 입력하세요...",
  onCommentSubmit,
  onLoginRequested,
}: CommentInputProps) {
  const { displayName } = useCurrentUser();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function triggerLogin() {
    onLoginRequested?.();
  }

  function handleInputClick(e: MouseEvent<HTMLInputElement>) {
    if (!displayName) {
      e.preventDefault();
      triggerLogin();
    }
  }

  async function handleSubmit() {
    if (!displayName) {
      triggerLogin();
      return;
    }
    if (!comment.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(apiEndpoint, {
        body: JSON.stringify({ content: comment.trim() }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      assert(res.ok, "Failed to submit comment");

      const newComment = (await res.json()) as Comment;
      onCommentSubmit?.(newComment);
      setComment("");
    } catch (err) {
      console.error("Comment submission failed:", err);
      alert("댓글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div className={cn("fixed inset-x-0 bottom-4 z-50 flex justify-center px-4", className)}>
      <div className="flex w-[min(92vw,1000px)] items-center gap-3 rounded-2xl bg-[#918c7f00] px-4 py-3 backdrop-blur-md">
        <input
          className="h-11 flex-1 rounded-xl border border-[#ffffff76] bg-[#b9b7b410] px-3 text-sm text-[#e5e2e2] placeholder-[#838382b9] transition-colors outline-none placeholder:text-xs hover:border-[#c4bda8] focus:border-[#c4bda8] disabled:opacity-50 md:text-base"
          disabled={isSubmitting}
          placeholder={displayName ? placeholder : "로그인 후 댓글을 작성할 수 있습니다."}
          readOnly={!displayName}
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          onMouseDown={handleInputClick}
        />
        <Button
          className="h-11 w-11 shrink-0 rounded-xl border border-[#ffffff72] bg-[#bcb8b82d] disabled:opacity-50"
          disabled={isSubmitting}
          size="sm"
          variant="icon"
          onClick={handleSubmit}
        >
          <PaperAirplaneIcon className="size-5 text-[#afaeaed1] hover:text-[#edecea]" />
        </Button>
      </div>
    </div>
  );
}
