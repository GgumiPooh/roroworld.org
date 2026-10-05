import { getAuthenticatedUserId } from "@/shared/auth";
import { galleries, galleryLikes, getDb } from "@/shared/db";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return new Response("unauthorized", { status: 401 });
  }

  const rawParams = await context.params;
  const parsed = paramsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return Response.json({ error: "invalid_gallery_id" }, { status: 400 });
  }

  const { id: galleryId } = parsed.data;
  const db = getDb();

  const gallery = await db.query.galleries.findFirst({
    where: (galleryTable, { and: andCondition, eq: eqField, isNull: isNullField }) =>
      andCondition(eqField(galleryTable.id, galleryId), isNullField(galleryTable.deletedAt)),
  });

  if (!gallery) {
    return Response.json({ error: "Gallery not found" }, { status: 404 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      const existingLike = await tx.query.galleryLikes.findFirst({
        where: (likeTable, { and: andCondition, eq: eqField }) =>
          andCondition(eqField(likeTable.galleryId, galleryId), eqField(likeTable.userId, userId)),
      });

      if (existingLike) {
        await tx
          .delete(galleryLikes)
          .where(and(eq(galleryLikes.galleryId, galleryId), eq(galleryLikes.userId, userId)));

        const [updated] = await tx
          .update(galleries)
          .set({ likeCount: sql`GREATEST(0, ${galleries.likeCount} - 1)` })
          .where(eq(galleries.id, galleryId))
          .returning({ likeCount: galleries.likeCount });

        return {
          likeCount: updated?.likeCount ?? 0,
          liked: false,
        };
      }

      await tx.insert(galleryLikes).values({
        galleryId,
        userId,
      });

      const [updated] = await tx
        .update(galleries)
        .set({ likeCount: sql`${galleries.likeCount} + 1` })
        .where(eq(galleries.id, galleryId))
        .returning({ likeCount: galleries.likeCount });

      return {
        likeCount: updated?.likeCount ?? 1,
        liked: true,
      };
    });

    return Response.json(result);
  } catch {
    return Response.json({ error: "failed_to_toggle_like" }, { status: 500 });
  }
}
