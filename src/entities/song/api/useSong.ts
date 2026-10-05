"use client";

import { A_MINUTE, resolveLocalizedText } from "@/shared/lib";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { type SongDetail, type SongDetailView } from "../model/types";

async function fetchSong(
  albumId: number | string,
  trackNumber: number | string,
): Promise<SongDetail | null> {
  const res = await fetch(`/api/public/album/${albumId}/song/${trackNumber}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch song");
  }

  return res.json();
}

export function useSong(albumId?: number | string, trackNumber?: number | string) {
  const query = useQuery({
    enabled: Boolean(albumId && trackNumber),
    queryFn: () => fetchSong(albumId!, trackNumber!),
    queryKey: ["song", albumId, trackNumber],
    staleTime: A_MINUTE,
  });

  const detailView = useMemo((): SongDetailView | null => {
    if (!query.data) {
      return null;
    }

    const meta = query.data.metadata ?? [];
    const videoUrl = meta.find((m) => m.type === "video")?.url ?? "";
    const imgUrl = meta.find((m) => m.type === "img")?.url ?? "";

    return {
      ...query.data,
      description: resolveLocalizedText(query.data.description),
      imgUrl,
      lyrics: resolveLocalizedText(query.data.lyrics),
      title: resolveLocalizedText(query.data.title),
      videoUrl,
    };
  }, [query.data]);

  return {
    detail: query.data ?? null,
    detailView,
    error: query.error,
    isLoading: query.isLoading,
  };
}
