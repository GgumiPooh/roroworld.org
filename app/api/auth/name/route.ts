import { getAuthenticatedUserId } from "@/shared/auth";
import { getDb } from "@/shared/db";

export async function GET(req: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return new Response("no_access_token", { status: 401 });
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: (userTable, { and, eq, isNull }) =>
      and(eq(userTable.id, userId), isNull(userTable.deletedAt)),
  });

  if (!user) {
    return new Response("user_not_found", { status: 401 });
  }

  const displayName = user.nickname || user.name || "";

  return Response.json({
    id: user.id,
    name: displayName,
    nickname: user.nickname ?? undefined,
  });
}
