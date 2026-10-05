import { clearAuthCookies, getAuthenticatedUserId } from "@/shared/auth";
import { getDb, users } from "@/shared/db";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return new Response("no_access_token", { status: 401 });
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: (userTable, { eq: eqField }) => eqField(userTable.id, userId),
  });

  if (!user) {
    return new Response("user_not_found", { status: 401 });
  }

  try {
    // INFO: Hard delete cascades to related tables per database foreign key constraints.
    await db.delete(users).where(eq(users.id, userId));

    const headers = new Headers();
    clearAuthCookies(headers);

    return new Response("ok", { headers, status: 200 });
  } catch {
    return new Response("failed_to_delete_account", { status: 500 });
  }
}
