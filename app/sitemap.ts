import { getEnv } from "@/shared/config";
import { findAllPublishedAlbums } from "@/shared/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getEnv("NEXT_PUBLIC_APP_URL", "https://roroworld.org");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 1.0,
      url: `${baseUrl}`,
    },
    {
      changeFrequency: "weekly",
      lastModified: now,
      priority: 0.8,
      url: `${baseUrl}/activity`,
    },
    {
      changeFrequency: "weekly",
      lastModified: now,
      priority: 0.9,
      url: `${baseUrl}/albums`,
    },
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 0.8,
      url: `${baseUrl}/gallery`,
    },
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 0.7,
      url: `${baseUrl}/toArtist`,
    },
  ];

  try {
    const albums = await findAllPublishedAlbums();

    const albumRoutes: MetadataRoute.Sitemap = albums.map((album) => ({
      changeFrequency: "monthly",
      lastModified: album.updatedAt ? new Date(album.updatedAt) : now,
      priority: 0.8,
      url: `${baseUrl}/album/${album.id}`,
    }));

    const songRoutes: MetadataRoute.Sitemap = albums.flatMap((album) =>
      album.songs.map((song) => ({
        changeFrequency: "monthly",
        lastModified: song.updatedAt ? new Date(song.updatedAt) : now,
        priority: 0.7,
        url: `${baseUrl}/album/${album.id}/song/${song.trackNumber}`,
      })),
    );

    return [...staticRoutes, ...albumRoutes, ...songRoutes];
  } catch {
    // INFO: Fallback to static routes when database is unreachable during sitemap generation
    return staticRoutes;
  }
}
