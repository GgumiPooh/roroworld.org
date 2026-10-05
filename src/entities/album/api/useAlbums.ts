"use client";

import { A_MINUTE, findCoverUrl, resolveLocalizedText } from "@/shared/lib";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { type Album, type AlbumView } from "../model/types";

async function fetchAlbums(): Promise<Album[]> {
  const res = await fetch("/api/public/album", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch albums");
  }

  return res.json();
}

async function fetchAlbumSongs(albumId: number): Promise<{ trackNumber?: number; id: number }[]> {
  const res = await fetch(`/api/public/album/${albumId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch album songs");
  }

  const songs = await res.json();
  return songs.map((s: { trackNumber?: number; id: number }) => ({
    id: s.id,
    trackNumber: s.trackNumber,
  }));
}

export function useAlbums() {
  const albumsQuery = useQuery({
    queryFn: fetchAlbums,
    queryKey: ["albums"],
    staleTime: A_MINUTE,
  });

  const albumsView = useMemo((): AlbumView[] => {
    if (!albumsQuery.data) {
      return [];
    }

    return albumsQuery.data.map((album) => ({
      ...album,
      coverUrl: findCoverUrl(album.metadata),
      descriptionText: resolveLocalizedText(album.description),
      titleText: resolveLocalizedText(album.title),
    }));
  }, [albumsQuery.data]);

  return {
    albums: albumsQuery.data ?? [],
    albumsView,
    error: albumsQuery.error,
    fetchAlbumSongs,
    isLoading: albumsQuery.isLoading,
  };
}
