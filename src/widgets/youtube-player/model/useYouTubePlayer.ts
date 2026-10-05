"use client";

import { assert, type Nullable } from "@/shared/lib";
import { createContext, useContext } from "react";
import { type YouTubePlayerContextValue } from "./types";

export const YouTubePlayerContext = createContext<Nullable<YouTubePlayerContextValue>>(null);

export function useYouTubePlayer(): YouTubePlayerContextValue {
  const context = useContext(YouTubePlayerContext);
  assert(context, "useYouTubePlayer must be used within YouTubePlayerProvider");
  return context;
}
