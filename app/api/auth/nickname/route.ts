import { getAuthenticatedUserId, setAuthCookies, signAccessToken } from "@/shared/auth";
import { getDb, users } from "@/shared/db";
import { and, eq, isNull, ne } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  nickname: z.string(),
});

export async function PUT(req: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return new Response("no_access_token", { status: 401 });
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: (userTable, { and: andCondition, eq: eqField, isNull: isNullField }) =>
      andCondition(eqField(userTable.id, userId), isNullField(userTable.deletedAt)),
  });

  if (!user) {
    return new Response("user_not_found", { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response("nickname_too_short", { status: 400 });
  }

  const trimmedNickname = parsed.data.nickname.trim();
  if (trimmedNickname.length < 2) {
    return new Response("nickname_too_short", { status: 400 });
  }

  if (trimmedNickname === user.nickname) {
    return Response.json({ nickname: user.nickname });
  }

  // INFO: Prevent duplicate nickname collisions across non-deleted user accounts.
  const existingUser = await db.query.users.findFirst({
    where: and(eq(users.nickname, trimmedNickname), ne(users.id, userId), isNull(users.deletedAt)),
  });

  if (existingUser) {
    return new Response("nickname_already_exists", { status: 409 });
  }

  try {
    await db.update(users).set({ nickname: trimmedNickname }).where(eq(users.id, userId));

    const newAccessToken = await signAccessToken(userId, trimmedNickname);
    const headers = new Headers();
    setAuthCookies(headers, newAccessToken);

    return Response.json({ nickname: trimmedNickname }, { headers });
  } catch {
    return new Response("failed_to_update_nickname", { status: 500 });
  }
}
