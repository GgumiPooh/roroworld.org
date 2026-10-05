import { getAuthenticatedUserId } from "@/shared/auth";
import { galleries, getDb } from "@/shared/db";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext): Promise<Response> {
  const rawParams = await context.params;
  const parsed = paramsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return Response.json({ error: "invalid_gallery_id" }, { status: 400 });
  }

  const { id: galleryId } = parsed.data;
  const db = getDb();
  const userId = await getAuthenticatedUserId(req);

  // INFO: Atomically increment view count on detail retrieval.
  await db
    .update(galleries)
    .set({ viewCount: sql`${galleries.viewCount} + 1` })
    .where(and(eq(galleries.id, galleryId), isNull(galleries.deletedAt)));

  const gallery = await db.query.galleries.findFirst({
    where: (galleryTable, { and: andCondition, eq: eqField, isNull: isNullField }) =>
      andCondition(eqField(galleryTable.id, galleryId), isNullField(galleryTable.deletedAt)),
    with: {
      comments: {
        orderBy: (commentTable, { desc }) => [desc(commentTable.createdAt)],
        where: (commentTable, { isNull: isNullField }) => isNullField(commentTable.deletedAt),
        with: {
          user: true,
        },
      },
      images: {
        orderBy: (imageTable, { asc }) => [asc(imageTable.displayOrder)],
        where: (imageTable, { isNull: isNullField }) => isNullField(imageTable.deletedAt),
      },
      user: true,
    },
  });

  if (!gallery) {
    return Response.json({ error: "gallery_not_found" }, { status: 404 });
  }

  let isLikedByMe = false;
  if (userId) {
    const likeRecord = await db.query.galleryLikes.findFirst({
      where: (likeTable, { and: andCondition, eq: eqField }) =>
        andCondition(eqField(likeTable.galleryId, galleryId), eqField(likeTable.userId, userId)),
    });
    isLikedByMe = Boolean(likeRecord);
  }

  const comments = gallery.comments.map((comment) => ({
    authorName: comment.user?.nickname || "익명",
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    id: comment.id,
  }));

  const responseDetail = {
    authorId: gallery.userId,
    authorName: gallery.user?.nickname || "익명",
    commentCount: comments.length,
    comments,
    createdAt: gallery.createdAt.toISOString(),
    description: gallery.description,
    id: gallery.id,
    imageUrls: gallery.images.map((image) => image.imageUrl),
    isLikedByMe,
    likeCount: gallery.likeCount,
    title: gallery.title,
    viewCount: gallery.viewCount,
  };

  return Response.json(responseDetail);
}

export async function DELETE(req: Request, context: RouteContext): Promise<Response> {
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
    return Response.json({ error: "gallery_not_found" }, { status: 404 });
  }

  // INFO: Restrict gallery deletion to the creator.
  if (gallery.userId !== userId) {
    return Response.json({ error: "Not authorized to delete this gallery" }, { status: 400 });
  }

  try {
    await db.delete(galleries).where(eq(galleries.id, galleryId));
    return new Response(null, { status: 200 });
  } catch {
    return Response.json({ error: "failed_to_delete_gallery" }, { status: 500 });
  }
}
