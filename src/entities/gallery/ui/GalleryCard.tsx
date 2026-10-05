import { cn } from "@/shared/lib";
import { ChatBubbleLeftIcon, EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import { type KeyboardEvent } from "react";
import { type GalleryItem } from "../model/types";

export type GalleryCardProps = {
  className?: string;
  gallery: GalleryItem;
  onClick?: () => void;
};

export function GalleryCard({ className, gallery, onClick }: GalleryCardProps) {
  const thumbnailUrl = gallery.imageUrls[0] || "";

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <div
      className={cn(
        "group cursor-pointer overflow-hidden rounded-xl transition-transform hover:scale-[1.02] focus-visible:outline-plum-400",
        className,
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="aspect-3/4 overflow-hidden rounded-xl bg-gray-800">
        {thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={gallery.title}
            src={thumbnailUrl}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gray-700">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="mb-1 truncate text-sm font-medium text-plum-100">{gallery.title}</h3>
        <p className="mb-2 text-xs text-gray-400">{gallery.authorName}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <HeartIcon className="size-3.5" />
            {gallery.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="size-3.5" />
            {gallery.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <EyeIcon className="size-3.5" />
            {gallery.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}
