import { getDb } from "@/shared/db";
import { z } from "zod";

const paramsSchema = z.object({
  albumId: z.coerce.number().int().positive(),
  trackNumber: z.coerce.number().int().positive(),
});

type RouteContext = {
  params: Promise<{ albumId: string; trackNumber: string }>;
};

export async function GET(_req: Request, context: RouteContext): Promise<Response> {
  const rawParams = await context.params;
  const parsed = paramsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return Response.json({ error: "invalid_parameters" }, { status: 400 });
  }

  const { albumId, trackNumber } = parsed.data;
  const db = getDb();

  const song = await db.query.songs.findFirst({
    where: (songs, { and, eq, isNull }) =>
      and(eq(songs.albumId, albumId), eq(songs.trackNumber, trackNumber), isNull(songs.deletedAt)),
  });

  if (!song) {
    return Response.json({ error: "song_not_found" }, { status: 404 });
  }

  return Response.json({
    albumId: song.albumId,
    description: song.description,
    id: song.id,
    lyrics: song.lyrics,
    metadata: song.metadata,
    title: song.title,
    trackNumber: song.trackNumber,
  });
}
