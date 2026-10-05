import { AlbumDetailPage } from "@/pages/album-detail";
import { findAlbumById } from "@/shared/db";
import {
  createBreadcrumbSchema,
  createMusicAlbumSchema,
  findCoverUrl,
  resolveLocalizedText,
} from "@/shared/lib";
import { JsonLd } from "@/shared/ui";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { albumId } = await params;
  const album = await findAlbumById(Number(albumId));

  if (!album) {
    return {
      description: "한로로의 앨범 상세 정보입니다.",
      title: "앨범 상세",
    };
  }

  const titleText = resolveLocalizedText(album.title) || `앨범 #${albumId}`;
  const descriptionText =
    resolveLocalizedText(album.description) ||
    `${titleText} - 싱어송라이터 한로로(HANRORO)의 앨범 정보 및 수록곡 목록입니다.`;
  const coverUrl = findCoverUrl(album.metadata);

  return {
    alternates: {
      canonical: `/album/${albumId}`,
    },
    description: descriptionText,
    openGraph: {
      description: descriptionText,
      images: coverUrl ? [{ alt: `${titleText} 앨범 커버`, url: coverUrl }] : undefined,
      title: `${titleText} | RORO WORLD`,
      url: `/album/${albumId}`,
    },
    title: titleText,
    twitter: {
      card: "summary_large_image",
      description: descriptionText,
      images: coverUrl ? [coverUrl] : undefined,
      title: `${titleText} | RORO WORLD`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { albumId } = await params;
  const album = await findAlbumById(Number(albumId));

  const titleText = album
    ? resolveLocalizedText(album.title) || `앨범 #${albumId}`
    : `앨범 #${albumId}`;
  const descriptionText = album
    ? resolveLocalizedText(album.description) ||
      `${titleText} - 싱어송라이터 한로로(HANRORO)의 앨범`
    : "";
  const coverUrl = album ? findCoverUrl(album.metadata) : "";

  const tracks = album?.songs.map((song) => ({
    name: resolveLocalizedText(song.title) || `Track ${song.trackNumber ?? ""}`,
    trackNumber: song.trackNumber ?? undefined,
    url: `https://roroworld.org/album/${albumId}/song/${song.trackNumber}`,
  }));

  const schemas = [
    createMusicAlbumSchema({
      datePublished: album?.publishedAt ?? undefined,
      description: descriptionText,
      image: coverUrl,
      name: titleText,
      tracks,
      url: `https://roroworld.org/album/${albumId}`,
    }),
    createBreadcrumbSchema([
      { item: "/", name: "홈" },
      { item: "/albums", name: "앨범" },
      { item: `/album/${albumId}`, name: titleText },
    ]),
  ];

  return (
    <>
      <JsonLd schema={schemas} />
      <AlbumDetailPage albumId={albumId} />
    </>
  );
}
