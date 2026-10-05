import "server-only";

import { type Nullable } from "@/shared/lib";
import { cache } from "react";

import { getDb } from "./client";

export const findAlbumById = cache(async (albumId: number) => {
  try {
    const db = getDb();
    const album = await db.query.albums.findFirst({
      where: (albums, { and, eq, isNull }) => and(eq(albums.id, albumId), isNull(albums.deletedAt)),
      with: {
        songs: {
          orderBy: (songs, { asc }) => [asc(songs.trackNumber)],
          where: (songs, { isNull }) => isNull(songs.deletedAt),
        },
      },
    });

    return (album ?? null) as Nullable<typeof album>;
  } catch {
    // INFO: Fallback when database is unreachable during static analysis or build
    return null;
  }
});

export const findSongByTrack = cache(async (albumId: number, trackNumber: number) => {
  try {
    const db = getDb();
    const song = await db.query.songs.findFirst({
      where: (songs, { and, eq, isNull }) =>
        and(
          eq(songs.albumId, albumId),
          eq(songs.trackNumber, trackNumber),
          isNull(songs.deletedAt),
        ),
      with: {
        album: true,
      },
    });

    return (song ?? null) as Nullable<typeof song>;
  } catch {
    // INFO: Fallback when database is unreachable during static analysis or build
    return null;
  }
});

export const findAllPublishedAlbums = cache(async () => {
  try {
    const db = getDb();
    return await db.query.albums.findMany({
      orderBy: (albums, { desc }) => [desc(albums.publishedAt)],
      where: (albums, { isNull }) => isNull(albums.deletedAt),
      with: {
        songs: {
          orderBy: (songs, { asc }) => [asc(songs.trackNumber)],
          where: (songs, { isNull }) => isNull(songs.deletedAt),
        },
      },
    });
  } catch {
    // INFO: Fallback when database is unreachable during static analysis or build
    return [];
  }
});
