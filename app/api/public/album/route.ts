import { getDb } from "@/shared/db";

export async function GET(): Promise<Response> {
  const db = getDb();

  const albumList = await db.query.albums.findMany({
    orderBy: (albums, { desc }) => [desc(albums.publishedAt)],
    where: (albums, { isNull }) => isNull(albums.deletedAt),
    with: {
      songs: {
        orderBy: (songs, { asc }) => [asc(songs.trackNumber)],
        where: (songs, { isNull }) => isNull(songs.deletedAt),
      },
    },
  });

  const responseList = albumList.map((album) => ({
    albumType: album.type,
    description: album.description,
    id: album.id,
    metadata: album.metadata,
    publishedAt: album.publishedAt,
    songs: album.songs.map((song) => ({
      id: song.id,
      trackNumber: song.trackNumber,
    })),
    title: album.title,
  }));

  return Response.json(responseList);
}
