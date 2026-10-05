"use client";

import { useCurrentUser } from "@/entities/user";
import { cn, type Nullable } from "@/shared/lib";
import { Button } from "@/shared/ui";
import {
  ArrowDownTrayIcon,
  ChatBubbleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { useEvent } from "react-use";

export type GalleryCommentItem = {
  authorName: string;
  content: string;
  createdAt: string;
  id: number;
};

type GalleryDetailData = {
  authorId: number | string;
  authorName: string;
  commentCount: number;
  comments: GalleryCommentItem[];
  createdAt: string;
  description: string;
  imageUrls: string[];
  isLikedByMe: boolean;
  likeCount: number;
  title: string;
  viewCount: number;
  id: number;
};

export type GalleryDetailOverlayProps = {
  className?: string;
  galleryId: number;
  isOpen?: boolean;
  commentInputSlot?:
    | ReactNode
    | ((helpers: { onCommentSubmit: (comment: GalleryCommentItem) => void }) => ReactNode);
  onClose: () => void;
  onDeleted?: () => void;
  onLoginRequested?: () => void;
};

export function GalleryDetailOverlay({
  className,
  commentInputSlot,
  galleryId,
  isOpen = true,
  onClose,
  onDeleted,
  onLoginRequested,
}: GalleryDetailOverlayProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<Nullable<boolean>>(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<Nullable<number>>(null);
  const [addedComments, setAddedComments] = useState<GalleryCommentItem[]>([]);

  const { displayName, user } = useCurrentUser();

  useEvent("keydown", (e: KeyboardEvent) => {
    if (e.isComposing) {
      return;
    }
    if (e.key === "Escape") {
      onClose();
    }
  });

  const query = useQuery({
    enabled: isOpen,
    queryFn: async (): Promise<GalleryDetailData> => {
      const res = await fetch(`/api/public/gallery/${galleryId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch gallery");
      }
      return res.json();
    },
    queryKey: ["gallery", galleryId],
  });

  const gallery = query.data;
  const isOwner = Boolean(user && gallery && String(user.id) === String(gallery.authorId));

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleCommentSubmit = useCallback((comment: GalleryCommentItem) => {
    setAddedComments((prev) => [comment, ...prev]);
  }, []);

  if (!isOpen) {
    return null;
  }

  const isLikedByMe = optimisticLiked ?? gallery?.isLikedByMe ?? false;
  const likeCount = optimisticLikeCount ?? gallery?.likeCount ?? 0;
  const allComments = [
    ...addedComments,
    ...(gallery?.comments ?? []).filter((c) => !addedComments.some((added) => added.id === c.id)),
  ];
  const commentCount = (gallery?.commentCount ?? 0) + addedComments.length;

  const handleLike = async () => {
    if (!displayName) {
      onLoginRequested?.();
      return;
    }

    if (!gallery) {
      return;
    }

    const nextLiked = !isLikedByMe;
    const nextCount = nextLiked ? likeCount + 1 : likeCount - 1;

    setOptimisticLiked(nextLiked);
    setOptimisticLikeCount(nextCount);

    try {
      const res = await fetch(`/api/public/gallery/${galleryId}/like`, {
        credentials: "include",
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to like");
      }

      const data = await res.json();
      if (data.likeCount !== undefined) {
        setOptimisticLiked(data.liked);
        setOptimisticLikeCount(data.likeCount);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setOptimisticLiked(gallery.isLikedByMe);
      setOptimisticLikeCount(gallery.likeCount);
    }
  };

  const handlePrevImage = () => {
    if (gallery) {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : gallery.imageUrls.length - 1));
    }
  };

  const handleNextImage = () => {
    if (gallery) {
      setCurrentImageIndex((prev) => (prev < gallery.imageUrls.length - 1 ? prev + 1 : 0));
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getMimeType = (url: string, blobType: string): string => {
    if (blobType && blobType.startsWith("image/")) {
      return blobType;
    }

    const extension = url.split(".").pop()?.toLowerCase().split("?")[0];
    const mimeTypes: Record<string, string> = {
      gif: "image/gif",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    return mimeTypes[extension || ""] || "image/jpeg";
  };

  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, "_blank");
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const supportsShare =
      typeof navigator.share === "function" && typeof navigator.canShare === "function";

    if (isMobile) {
      if (supportsShare) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const mimeType = getMimeType(imageUrl, blob.type);
          const file = new File([blob], filename, { type: mimeType });
          const shareData = { files: [file] };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            return;
          }
        }
      }

      openImageInNewTab(imageUrl);
      alert("이미지를 길게 눌러 저장해주세요");
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      openImageInNewTab(imageUrl);
    }
  };

  const handleDownloadCurrent = () => {
    if (gallery) {
      const filename = `${gallery.title}_${currentImageIndex + 1}.jpg`;
      const currentUrl = gallery.imageUrls[currentImageIndex];
      if (currentUrl) {
        downloadImage(currentUrl, filename);
      }
    }
    setShowDownloadMenu(false);
  };

  const handleDownloadAll = async () => {
    if (gallery) {
      for (let i = 0; i < gallery.imageUrls.length; i++) {
        const filename = `${gallery.title}_${i + 1}.jpg`;
        const currentUrl = gallery.imageUrls[i];
        if (currentUrl) {
          await downloadImage(currentUrl, filename);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }
    setShowDownloadMenu(false);
  };

  const handleDelete = async () => {
    if (!gallery) {
      return;
    }

    const confirmed = window.confirm("이 게시물을 삭제하시겠습니까?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/public/gallery/${galleryId}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (res.ok) {
        alert("게시물이 삭제되었습니다.");
        await queryClient.invalidateQueries({ queryKey: ["galleries"] });
        onClose();
        if (onDeleted) {
          onDeleted();
        } else {
          router.refresh();
        }
      } else {
        const error = await res.text();
        alert(`삭제 실패: ${error}`);
      }
    } catch (err) {
      console.error("Failed to delete gallery:", err);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (query.isLoading) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm",
          className,
        )}
      >
        <div className="size-10 animate-spin rounded-full border-2 border-plum-400 border-t-transparent" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm",
          className,
        )}
      >
        <div className="text-center text-gray-400">
          <p>게시물을 찾을 수 없습니다.</p>
          <Button className="mt-4" size="md" variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-60 flex items-center justify-center px-2 backdrop-blur-sm",
        className,
      )}
      onClick={onClose}
    >
      <div
        className="relative flex h-[95vh] w-[min(92vw,900px)] flex-col overflow-y-auto rounded-2xl bg-black/90 pt-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {isOwner && (
            <button
              className="bg-red-500/70 hover:bg-red-600/90 rounded-full p-2 text-white transition-colors disabled:opacity-50"
              disabled={isDeleting}
              title="삭제"
              type="button"
              onClick={handleDelete}
            >
              <TrashIcon className="size-4 md:size-6" />
            </button>
          )}

          <div className="relative">
            <button
              className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              type="button"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            >
              <ArrowDownTrayIcon className="size-4 md:size-6" />
            </button>

            {showDownloadMenu && (
              <div className="absolute top-full right-0 mt-2 w-40 overflow-hidden rounded-xl bg-gray-800/95 shadow-lg backdrop-blur-sm">
                <button
                  className="w-full px-4 py-3 text-left text-sm text-white transition-colors hover:bg-gray-700/50"
                  type="button"
                  onClick={handleDownloadCurrent}
                >
                  이 사진만 저장
                </button>
                {gallery.imageUrls.length > 1 && (
                  <button
                    className="w-full border-t border-gray-700 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-gray-700/50"
                    type="button"
                    onClick={handleDownloadAll}
                  >
                    전체 사진 저장 ({gallery.imageUrls.length}장)
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            type="button"
            onClick={onClose}
          >
            <XMarkIcon className="size-4 md:size-6" />
          </button>
        </div>

        <div
          className="relative mx-auto flex w-[90%] shrink-0 flex-col items-center justify-center p-5"
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
        >
          <div className="relative flex items-center justify-center">
            {gallery.imageUrls.length > 1 && (
              <button
                className="absolute left-0 z-10 -translate-x-full rounded-full border border-gray-700/60 bg-black/50 p-2 text-white transition-colors hover:bg-black/70 md:-translate-x-[150%]"
                type="button"
                onClick={handlePrevImage}
              >
                <ChevronLeftIcon className="size-4 md:size-6" />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="max-h-[60vh] max-w-full object-contain"
              alt={gallery.title}
              src={gallery.imageUrls[currentImageIndex]}
            />

            {gallery.imageUrls.length > 1 && (
              <button
                className="absolute right-0 z-10 translate-x-full rounded-full border border-gray-700/60 bg-black/50 p-2 text-white transition-colors hover:bg-black/70 md:translate-x-[150%]"
                type="button"
                onClick={handleNextImage}
              >
                <ChevronRightIcon className="size-4 md:size-6" />
              </button>
            )}
          </div>

          {gallery.imageUrls.length > 1 && (
            <div className="mt-4 flex gap-2">
              {gallery.imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  className={`size-2 rounded-full transition-colors ${
                    idx === currentImageIndex ? "bg-white" : "bg-white/40"
                  }`}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative flex w-full flex-col">
          <div className="border-b border-gray-700/60 p-4 md:p-6">
            <h2 className="text-2xl font-bold text-white">{gallery.title}</h2>
            <p className="mt-2 text-sm text-gray-400">
              by {gallery.authorName} · {formatDate(gallery.createdAt)}
            </p>
            {gallery.description && <p className="mt-3 text-gray-300">{gallery.description}</p>}

            <div className="mt-4 flex items-center gap-4">
              <button
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-plum-400"
                type="button"
                onClick={handleLike}
              >
                {isLikedByMe && user ? (
                  <HeartIconSolid className="text-red-500 size-6" />
                ) : (
                  <HeartIcon className="size-6" />
                )}
                <span>{likeCount}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-400">
                <ChatBubbleLeftIcon className="size-6" />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>

          <div className="mb-15 p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">댓글</h3>

            {allComments.length === 0 ? (
              <p className="text-center text-gray-500">아직 댓글이 없습니다.</p>
            ) : (
              <div className="mb-24 space-y-4">
                {allComments.map((comment) => (
                  <div key={comment.id} className="rounded-xl bg-gray-900/40 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-plum-300">{comment.authorName}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {commentInputSlot && (
            <div className="bottom-0 z-50 p-1 md:p-4">
              {typeof commentInputSlot === "function"
                ? commentInputSlot({ onCommentSubmit: handleCommentSubmit })
                : commentInputSlot}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
