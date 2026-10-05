import {
  generateSecureRandomToken,
  hashRefreshToken,
  readCookie,
  setAuthCookies,
  signAccessToken,
} from "@/shared/auth";
import { getDb, refreshTokens } from "@/shared/db";
import { A_DAY } from "@/shared/lib";
import { eq } from "drizzle-orm";

export async function POST(req: Request): Promise<Response> {
  const refreshToken = readCookie(req, "refresh_token");
  if (!refreshToken) {
    return new Response("no_refresh_token", { status: 401 });
  }

  const db = getDb();

  try {
    const hash = hashRefreshToken(refreshToken);
    const existing = await db.query.refreshTokens.findFirst({
      where: (rt, { and: andCondition, eq: eqField }) =>
        andCondition(eqField(rt.tokenHash, hash), eqField(rt.revoked, false)),
    });

    if (!existing || existing.expiresAt < new Date()) {
      return new Response("invalid_or_expired_refresh", { status: 401 });
    }

    // INFO: Mark existing refresh token as revoked to prevent reuse.
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, existing.id));

    const user = await db.query.users.findFirst({
      where: (userTable, { and: andCondition, eq: eqField, isNull: isNullField }) =>
        andCondition(eqField(userTable.id, existing.userId), isNullField(userTable.deletedAt)),
    });

    if (!user) {
      return new Response("user_not_found", { status: 401 });
    }

    const displayName = user.nickname || user.name || "";
    const newAccessToken = await signAccessToken(user.id, displayName);
    const newRefreshPlain = generateSecureRandomToken();
    const newRefreshHash = hashRefreshToken(newRefreshPlain);

    const refreshExpiresAt = new Date(Date.now() + 30 * A_DAY);

    await db.insert(refreshTokens).values({
      expiresAt: refreshExpiresAt,
      revoked: false,
      tokenHash: newRefreshHash,
      userId: user.id,
    });

    const headers = new Headers();
    setAuthCookies(headers, newAccessToken, newRefreshPlain);

    return new Response("ok", { headers, status: 200 });
  } catch {
    return new Response("refresh_failed", { status: 500 });
  }
}
