"use client";

import { A_MINUTE, resolveLocalizedText } from "@/shared/lib";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { type AlbumDetail, type LanguageData, type MetaData } from "../model/types";

export type SongInAlbum = {
  albumId: number;
  createdAt?: string;
  description?: LanguageData[];
  lyrics?: LanguageData[];
  metadata?: MetaData[];
  title?: LanguageData[];
  trackNumber?: number;
  id: number;
};

export type SongInAlbumView = Omit<SongInAlbum, "description" | "lyrics" | "title"> & {
  description: string;
  lyrics: string;
  title: string;
};

async function fetchAlbumDetail(
  albumId: number | string,
): Promise<{ album: AlbumDetail | null; songs: SongInAlbum[] }> {
  const albumRes = await fetch("/api/public/album", {
    credentials: "include",
  });

  if (!albumRes.ok) {
    throw new Error("Failed to fetch albums");
  }

  const albums: AlbumDetail[] = await albumRes.json();
  const album = albums.find((a) => a.id === Number(albumId)) ?? null;

  const songsRes = await fetch(`/api/public/album/${albumId}`, {
    credentials: "include",
  });

  if (!songsRes.ok) {
    throw new Error("Failed to fetch songs");
  }

  const songs: SongInAlbum[] = await songsRes.json();

  return { album, songs: songs ?? [] };
}

export function useAlbumDetail(albumId?: number | string) {
  const query = useQuery({
    enabled: Boolean(albumId),
    queryFn: () => fetchAlbumDetail(albumId!),
    queryKey: ["albumDetail", albumId],
    staleTime: A_MINUTE,
  });

  const detailView = useMemo(() => {
    if (!query.data) {
      return { songsView: [] };
    }

    const songsView: SongInAlbumView[] = (query.data.songs ?? []).map((s) => ({
      ...s,
      description: resolveLocalizedText(s.description),
      lyrics: resolveLocalizedText(s.lyrics),
      title: resolveLocalizedText(s.title),
    }));

    return { songsView };
  }, [query.data]);

  return {
    detail: query.data?.album ?? null,
    detailView,
    error: query.error,
    isLoading: query.isLoading,
  };
}
