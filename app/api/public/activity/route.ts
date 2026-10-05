import { createPageResponse } from "@/shared/api";
import { activities, getDb } from "@/shared/db";
import { and, asc, desc, gte, isNull, lt, sql } from "drizzle-orm";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).default(4),
  sort: z.enum(["latest", "oldest"]).default("latest"),
  year: z.coerce.number().int().optional(),
});

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const parsed = querySchema.safeParse(searchParams);
  if (!parsed.success) {
    return Response.json({ error: "invalid_query_parameters" }, { status: 400 });
  }

  const { page, size, sort, year } = parsed.data;
  const db = getDb();

  const conditions = [isNull(activities.deletedAt)];

  if (year !== undefined && !Number.isNaN(year)) {
    const startOfYear = `${year}-01-01`;
    const startOfNextYear = `${year + 1}-01-01`;
    conditions.push(gte(activities.activeFrom, startOfYear));
    conditions.push(lt(activities.activeFrom, startOfNextYear));
  }

  const whereClause = and(...conditions);

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(activities)
    .where(whereClause);

  const totalElements = totalCountResult?.count ?? 0;
  const orderDirection =
    sort === "oldest" ? asc(activities.activeFrom) : desc(activities.activeFrom);

  const activityRows = await db
    .select()
    .from(activities)
    .where(whereClause)
    .orderBy(orderDirection)
    .limit(size)
    .offset(page * size);

  const content = activityRows.map((item) => ({
    activeFrom: item.activeFrom,
    activeTo: item.activeTo,
    activityType: item.type,
    description: item.description,
    id: item.id,
    metaData: item.metadata,
    metadata: item.metadata,
    title: item.title,
  }));

  const responseData = createPageResponse(content, totalElements, page, size);
  return Response.json(responseData);
}
