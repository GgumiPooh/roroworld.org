import { getDb } from "@/shared/db";
import { z } from "zod";

const paramsSchema = z.object({
  albumId: z.coerce.number().int().positive(),
});

type RouteContext = {
  params: Promise<{ albumId: string }>;
};

export async function GET(_req: Request, context: RouteContext): Promise<Response> {
  const rawParams = await context.params;
  const parsed = paramsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return Response.json({ error: "invalid_album_id" }, { status: 400 });
  }

  const { albumId } = parsed.data;
  const db = getDb();

  const songList = await db.query.songs.findMany({
    orderBy: (songs, { asc }) => [asc(songs.trackNumber)],
    where: (songs, { and, eq, isNull }) => and(eq(songs.albumId, albumId), isNull(songs.deletedAt)),
  });

  const responseList = songList.map((song) => ({
    albumId: song.albumId,
    description: song.description,
    id: song.id,
    lyrics: song.lyrics,
    metadata: song.metadata,
    title: song.title,
    trackNumber: song.trackNumber,
  }));

  return Response.json(responseList);
}
