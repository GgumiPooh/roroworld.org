import { AlbumDetailPage } from "@/pages/album-detail";

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { albumId } = await params;
  return <AlbumDetailPage albumId={albumId} />;
}
