"use client";

import { AuthOverlayProvider } from "@/features/auth";
import { YouTubePlayerProvider } from "@/widgets/youtube-player";
import { type PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";

export function GlobalProvider({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <YouTubePlayerProvider>
        <AuthOverlayProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthOverlayProvider>
      </YouTubePlayerProvider>
    </QueryProvider>
  );
}
