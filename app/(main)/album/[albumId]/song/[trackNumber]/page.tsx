import { SongDetailPage } from "@/pages/song-detail";
import { findSongByTrack } from "@/shared/db";
import {
  createBreadcrumbSchema,
  createMusicRecordingSchema,
  findCoverUrl,
  resolveLocalizedText,
} from "@/shared/lib";
import { JsonLd } from "@/shared/ui";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ albumId: string; trackNumber: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { albumId, trackNumber } = await params;
  const song = await findSongByTrack(Number(albumId), Number(trackNumber));

  if (!song) {
    return {
      description: "한로로의 곡 상세 정보입니다.",
      title: "곡 상세",
    };
  }

  const songTitle = resolveLocalizedText(song.title) || `Track ${trackNumber}`;
  const albumTitle = song.album ? resolveLocalizedText(song.album.title) : "";
  const displayTitle = albumTitle ? `${songTitle} - ${albumTitle}` : songTitle;
  const descriptionText =
    resolveLocalizedText(song.description) ||
    `${songTitle} - 싱어송라이터 한로로(HANRORO)의 곡 정보와 가사입니다.`;
  const coverUrl =
    findCoverUrl(song.metadata) || (song.album ? findCoverUrl(song.album.metadata) : "");

  return {
    alternates: {
      canonical: `/album/${albumId}/song/${trackNumber}`,
    },
    description: descriptionText,
    openGraph: {
      description: descriptionText,
      images: coverUrl ? [{ alt: `${songTitle} 커버`, url: coverUrl }] : undefined,
      title: `${displayTitle} | RORO WORLD`,
      url: `/album/${albumId}/song/${trackNumber}`,
    },
    title: displayTitle,
    twitter: {
      card: "summary_large_image",
      description: descriptionText,
      images: coverUrl ? [coverUrl] : undefined,
      title: `${displayTitle} | RORO WORLD`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { albumId, trackNumber } = await params;
  const song = await findSongByTrack(Number(albumId), Number(trackNumber));

  const songTitle = song
    ? resolveLocalizedText(song.title) || `Track ${trackNumber}`
    : `Track ${trackNumber}`;
  const albumTitle = song?.album ? resolveLocalizedText(song.album.title) : "";
  const descriptionText = song ? resolveLocalizedText(song.description) : "";
  const lyricsText = song ? resolveLocalizedText(song.lyrics) : "";
  const coverUrl = song
    ? findCoverUrl(song.metadata) || (song.album ? findCoverUrl(song.album.metadata) : "")
    : "";

  const breadcrumbs = [
    { item: "/", name: "홈" },
    { item: "/albums", name: "앨범" },
    ...(albumTitle ? [{ item: `/album/${albumId}`, name: albumTitle }] : []),
    { item: `/album/${albumId}/song/${trackNumber}`, name: songTitle },
  ];

  const schemas = [
    createMusicRecordingSchema({
      albumName: albumTitle,
      albumUrl: `https://roroworld.org/album/${albumId}`,
      description: descriptionText,
      image: coverUrl,
      lyrics: lyricsText,
      name: songTitle,
      trackNumber: song?.trackNumber ?? Number(trackNumber),
      url: `https://roroworld.org/album/${albumId}/song/${trackNumber}`,
    }),
    createBreadcrumbSchema(breadcrumbs),
  ];

  return (
    <>
      <JsonLd schema={schemas} />
      <SongDetailPage albumId={albumId} trackNumber={trackNumber} />
    </>
  );
}
