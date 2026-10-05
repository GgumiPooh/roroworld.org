import { type Nullable } from "@/shared/lib";

export type YouTubePlayerState = {
  isPlaying: boolean;
  videoId: Nullable<string>;
};

export type YouTubePlayerActions = {
  pause: () => void;
  play: (videoId: string) => void;
  stop: () => void;
  toggle: (videoId: string) => void;
};

export type YouTubePlayerContextValue = YouTubePlayerActions & YouTubePlayerState;
