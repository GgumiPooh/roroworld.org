import { createPageResponse } from "@/shared/api";
import { galleries, getDb } from "@/shared/db";
import { and, ilike, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";

const searchParamsSchema = z.object({
  keyword: z.string().default(""),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).default(12),
});

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const parsed = searchParamsSchema.safeParse(searchParams);
  if (!parsed.success) {
    return Response.json({ error: "invalid_query_parameters" }, { status: 400 });
  }

  const { keyword, page, size } = parsed.data;
  const db = getDb();
  const trimmedKeyword = keyword.trim();

  const matchCondition = trimmedKeyword
    ? or(
        ilike(galleries.title, `%${trimmedKeyword}%`),
        ilike(galleries.description, `%${trimmedKeyword}%`),
      )
    : undefined;

  const whereClause = and(isNull(galleries.deletedAt), matchCondition);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(galleries)
    .where(whereClause);

  const totalElements = countResult?.count ?? 0;

  const galleryList = await db.query.galleries.findMany({
    limit: size,
    offset: page * size,
    orderBy: (galleryTable, { desc }) => [desc(galleryTable.createdAt)],
    where: (
      galleryTable,
      { and: andCondition, ilike: ilikeField, isNull: isNullField, or: orCondition },
    ) => {
      const condition = trimmedKeyword
        ? orCondition(
            ilikeField(galleryTable.title, `%${trimmedKeyword}%`),
            ilikeField(galleryTable.description, `%${trimmedKeyword}%`),
          )
        : undefined;

      return andCondition(isNullField(galleryTable.deletedAt), condition);
    },
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
