import { getAuthenticatedUserId } from "@/shared/auth";
import { galleryComments, getDb } from "@/shared/db";
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

  const comment = await db.query.galleryComments.findFirst({
    where: (commentTable, { and: andCondition, eq: eqField, isNull: isNullField }) =>
      andCondition(eqField(commentTable.id, commentId), isNullField(commentTable.deletedAt)),
  });

  if (!comment) {
    return Response.json({ error: "Comment not found" }, { status: 404 });
  }

  // INFO: Restrict comment deletion to the author.
  if (comment.userId !== userId) {
    return Response.json({ error: "Not authorized to delete this comment" }, { status: 400 });
  }

  try {
    await db
      .update(galleryComments)
      .set({ deletedAt: new Date() })
      .where(eq(galleryComments.id, commentId));

    return new Response(null, { status: 200 });
  } catch {
    return Response.json({ error: "failed_to_delete_comment" }, { status: 500 });
  }
}
