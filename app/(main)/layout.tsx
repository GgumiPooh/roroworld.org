"use client";

import { cn } from "@/shared/lib";
import { Header } from "@/widgets/header";
import { useYouTubePlayer, YouTubePlayerWidget } from "@/widgets/youtube-player";
import { type PropsWithChildren } from "react";

export type MainLayoutProps = PropsWithChildren<{
  className?: string;
}>;

export default function MainLayout({ className, children }: MainLayoutProps) {
  const { isPlaying, stop, videoId } = useYouTubePlayer();

  return (
    <div className={cn("relative min-h-dvh", className)}>
      <Header className="fixed inset-x-0 top-0 z-3 mx-5 mt-5" />
      <main>{children}</main>
      {videoId && isPlaying ? <YouTubePlayerWidget videoId={videoId} onClose={stop} /> : null}
    </div>
  );
}
