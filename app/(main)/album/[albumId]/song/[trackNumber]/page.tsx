import { SongDetailPage } from "@/pages/song-detail";

type PageProps = {
  params: Promise<{ albumId: string; trackNumber: string }>;
};

export default async function Page({ params }: PageProps) {
  const { albumId, trackNumber } = await params;
  return <SongDetailPage albumId={albumId} trackNumber={trackNumber} />;
}
