"use client";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";

export type YouTubePlayerWidgetProps = {
  className?: string;
  videoId: string;
  onClose: () => void;
};

export function YouTubePlayerWidget({ className, videoId, onClose }: YouTubePlayerWidgetProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1`;

  return (
    <div
      className={cn(
        "fixed right-4 bottom-25 z-50 overflow-hidden rounded-xl shadow-2xl",
        className,
      )}
    >
      <Button
        className="absolute top-0 right-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/80 text-xs text-white"
        size="sm"
        variant="icon"
        aria-label="플레이어 닫기"
        onClick={onClose}
      >
        ✕
      </Button>
      <iframe
        className="h-[110px] w-[196px] md:h-[158px] md:w-[280px] lg:h-[202px] lg:w-[360px]"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        src={embedUrl}
        title="YouTube video player"
      />
    </div>
  );
}
