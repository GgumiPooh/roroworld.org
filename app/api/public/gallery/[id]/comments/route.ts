import { getAuthenticatedUserId } from "@/shared/auth";
import { galleryComments, getDb } from "@/shared/db";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  content: z.string().trim().min(1, "content is required"),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext): Promise<Response> {
  const rawParams = await context.params;
  const parsed = paramsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return Response.json({ error: "invalid_gallery_id" }, { status: 400 });
  }

  const { id: galleryId } = parsed.data;
  const db = getDb();

  const commentList = await db.query.galleryComments.findMany({
    orderBy: (commentTable, { desc }) => [desc(commentTable.createdAt)],
    where: (commentTable, { and: andCondition, eq: eqField, isNull: isNullField }) =>
      andCondition(eqField(commentTable.galleryId, galleryId), isNullField(commentTable.deletedAt)),
    with: {
      user: true,
    },
  });

  const responseList = commentList.map((item) => ({
    authorName: item.user?.nickname || "익명",
    content: item.content,
    createdAt: item.createdAt.toISOString(),
    id: item.id,
  }));

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
    return Response.json({ error: "invalid_gallery_id" }, { status: 400 });
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

  const { id: galleryId } = parsedParams.data;
  const { content } = parsedBody.data;
  const db = getDb();

  const gallery = await db.query.galleries.findFirst({
    where: (galleryTable, { and: andCondition, eq: eqField, isNull: isNullField }) =>
      andCondition(eqField(galleryTable.id, galleryId), isNullField(galleryTable.deletedAt)),
  });

  if (!gallery) {
    return Response.json({ error: "Gallery not found" }, { status: 404 });
  }

  try {
    const [inserted] = await db
      .insert(galleryComments)
      .values({
        content,
        galleryId,
        userId,
      })
      .returning();

    const user = await db.query.users.findFirst({
      where: (userTable, { eq: eqField }) => eqField(userTable.id, userId),
    });

    return Response.json({
      authorName: user?.nickname || "익명",
      content: inserted.content,
      createdAt: inserted.createdAt.toISOString(),
      id: inserted.id,
    });
  } catch {
    return Response.json({ error: "failed_to_add_comment" }, { status: 500 });
  }
}
