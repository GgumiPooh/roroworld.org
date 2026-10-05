import { getAuthenticatedUserId } from "@/shared/auth";
import { commentSongs, getDb } from "@/shared/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const paramsSchema = z.object({
  commentId: z.coerce.number().int().positive(),
});

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

export async function DELETE(req: Request, context: RouteContext): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return new Response("unauthorized", { status: 401 });
  }

  const rawParams = await context.params;
  const parsed = paramsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return Response.json({ error: "invalid_comment_id" }, { status: 400 });
  }

  const { commentId } = parsed.data;
  const db = getDb();

  const comment = await db.query.commentSongs.findFirst({
    where: (commentTable, { and, eq: eqField, isNull }) =>
      and(eqField(commentTable.id, commentId), isNull(commentTable.deletedAt)),
  });

  if (!comment) {
    return Response.json({ error: "comment_not_found" }, { status: 404 });
  }

  // INFO: Restrict deletion to the author of the song comment.
  if (comment.userId !== userId) {
    return new Response("not_allowed", { status: 403 });
  }

  try {
    await db
      .update(commentSongs)
      .set({ deletedAt: new Date() })
      .where(eq(commentSongs.id, commentId));

    return new Response("ok", { status: 200 });
  } catch {
    return new Response("failed_to_delete_comment", { status: 500 });
  }
}
