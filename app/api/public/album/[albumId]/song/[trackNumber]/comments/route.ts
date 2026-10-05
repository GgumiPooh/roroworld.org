import { getAuthenticatedUserId } from "@/shared/auth";
import { commentSongs, getDb } from "@/shared/db";
import { formatDisplayDate } from "@/shared/lib";
import { z } from "zod";

const paramsSchema = z.object({
  albumId: z.coerce.number().int().positive(),
  trackNumber: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  content: z.string().trim().min(1),
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
    return Response.json([], { status: 200 });
  }

  const commentsList = await db.query.commentSongs.findMany({
    orderBy: (commentSongsTable, { desc }) => [desc(commentSongsTable.commentedAt)],
    where: (commentSongsTable, { and, eq, isNull }) =>
      and(eq(commentSongsTable.songId, song.id), isNull(commentSongsTable.deletedAt)),
    with: {
      user: true,
    },
  });

  const responseList = commentsList.map((c) => {
    const authorName = c.user?.nickname || "익명";
    const createdAtStr = formatDisplayDate(c.commentedAt);

    return {
      author: authorName,
      authorName,
      content: c.content,
      createdAt: createdAtStr,
      id: c.id,
    };
  });

  return Response.json(responseList);
}

export async function POST(req: Request, context: RouteContext): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return new Response("unauthorized", { status: 401 });
  }

  const rawParams = await context.params;
  const parsedParams = paramsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return Response.json({ error: "invalid_parameters" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  const { albumId, trackNumber } = parsedParams.data;
  const { content } = parsedBody.data;
  const db = getDb();

  const song = await db.query.songs.findFirst({
    where: (songs, { and, eq, isNull }) =>
      and(eq(songs.albumId, albumId), eq(songs.trackNumber, trackNumber), isNull(songs.deletedAt)),
  });

  if (!song) {
    return Response.json({ error: "song_not_found" }, { status: 404 });
  }

  try {
    const [inserted] = await db
      .insert(commentSongs)
      .values({
        content,
        songId: song.id,
        userId,
      })
      .returning();

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    const authorName = user?.nickname || "익명";
    const createdAtStr = formatDisplayDate(inserted.commentedAt);

    return Response.json({
      author: authorName,
      authorName,
      content: inserted.content,
      createdAt: createdAtStr,
      id: inserted.id,
    });
  } catch {
    return new Response("failed_to_save_comment", { status: 500 });
  }
}
