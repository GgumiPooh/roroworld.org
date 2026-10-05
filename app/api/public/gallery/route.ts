import { createPageResponse } from "@/shared/api";
import { getAuthenticatedUserId } from "@/shared/auth";
import { galleries, galleryImages, getDb } from "@/shared/db";
import { isNull, sql } from "drizzle-orm";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).default(6),
});

const createSchema = z.object({
  description: z.string().nullable().optional(),
  imageUrls: z.array(z.string().min(1)).min(1, "at least one image is required"),
  title: z.string().trim().min(1, "title is required"),
});

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const parsed = querySchema.safeParse(searchParams);
  if (!parsed.success) {
    return Response.json({ error: "invalid_query_parameters" }, { status: 400 });
  }

  const { page, size } = parsed.data;
  const db = getDb();

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(galleries)
    .where(isNull(galleries.deletedAt));

  const totalElements = countResult?.count ?? 0;

  const galleryList = await db.query.galleries.findMany({
    limit: size,
    offset: page * size,
    orderBy: (galleryTable, { desc }) => [desc(galleryTable.createdAt)],
    where: (galleryTable, { isNull: isNullField }) => isNullField(galleryTable.deletedAt),
    with: {
      comments: {
        where: (commentTable, { isNull: isNullField }) => isNullField(commentTable.deletedAt),
      },
      images: {
        orderBy: (imageTable, { asc }) => [asc(imageTable.displayOrder)],
        where: (imageTable, { isNull: isNullField }) => isNullField(imageTable.deletedAt),
      },
      user: true,
    },
  });

  const content = galleryList.map((item) => ({
    authorId: item.userId,
    authorName: item.user?.nickname || "익명",
    commentCount: item.comments.length,
    createdAt: item.createdAt.toISOString(),
    description: item.description,
    id: item.id,
    imageUrls: item.images.map((image) => image.imageUrl),
    likeCount: item.likeCount,
    title: item.title,
    viewCount: item.viewCount,
  }));

  const responseData = createPageResponse(content, totalElements, page, size);
  return Response.json(responseData);
}

export async function POST(req: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return new Response("unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "invalid_request_body";
    return Response.json({ error: message }, { status: 400 });
  }

  const { description, imageUrls, title } = parsed.data;
  const db = getDb();

  try {
    const createdId = await db.transaction(async (tx) => {
      const [newGallery] = await tx
        .insert(galleries)
        .values({
          description: description ?? null,
          title,
          userId,
        })
        .returning();

      await tx.insert(galleryImages).values(
        imageUrls.map((imageUrl, index) => ({
          displayOrder: index,
          galleryId: newGallery.id,
          imageUrl,
        })),
      );

      return newGallery.id;
    });

    return Response.json({ id: createdId });
  } catch {
    return Response.json({ error: "failed_to_create_gallery" }, { status: 500 });
  }
}
