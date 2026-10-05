import { clearAuthCookies, hashRefreshToken, readCookie } from "@/shared/auth";
import { getDb, refreshTokens } from "@/shared/db";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request): Promise<Response> {
  const refreshToken = readCookie(req, "refresh_token");

  if (refreshToken) {
    try {
      const hash = hashRefreshToken(refreshToken);
      const db = getDb();

      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(and(eq(refreshTokens.tokenHash, hash), eq(refreshTokens.revoked, false)));
    } catch {
      // INFO: Failure to revoke does not prevent clearing client cookies.
    }
  }

  const headers = new Headers();
  clearAuthCookies(headers);

  return new Response("ok", { headers, status: 200 });
}
