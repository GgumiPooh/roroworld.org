"use client";

import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { type YouTubePlayerState } from "../model/types";
import { YouTubePlayerContext } from "../model/useYouTubePlayer";

export type YouTubePlayerProviderProps = PropsWithChildren<{
  className?: string;
}>;

const INITIAL_STATE: YouTubePlayerState = {
  isPlaying: false,
  videoId: null,
};

export function YouTubePlayerProvider({ children }: YouTubePlayerProviderProps) {
  const [playerState, setPlayerState] = useState<YouTubePlayerState>(INITIAL_STATE);

  const play = useCallback((videoId: string) => {
    setPlayerState({ isPlaying: true, videoId });
  }, []);

  const pause = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const stop = useCallback(() => {
    setPlayerState(INITIAL_STATE);
  }, []);

  const toggle = useCallback(
    (videoId: string) => {
      const isSameVideo = playerState.videoId === videoId;
      if (isSameVideo && playerState.isPlaying) {
        stop();
      } else {
        play(videoId);
      }
    },
    [playerState.videoId, playerState.isPlaying, play, stop],
  );

  const contextValue = useMemo(
    () => ({ ...playerState, pause, play, stop, toggle }),
    [playerState, play, pause, stop, toggle],
  );

  return (
    <YouTubePlayerContext.Provider value={contextValue}>{children}</YouTubePlayerContext.Provider>
  );
}
