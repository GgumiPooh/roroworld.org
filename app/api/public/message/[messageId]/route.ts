import { getAuthenticatedUserId } from "@/shared/auth";
import { getDb, messagesToArtist } from "@/shared/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const paramsSchema = z.object({
  messageId: z.coerce.number().int().positive(),
});

type RouteContext = {
  params: Promise<{ messageId: string }>;
};

export async function DELETE(req: Request, context: RouteContext): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return new Response("unauthorized", { status: 401 });
  }

  const rawParams = await context.params;
  const parsed = paramsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return Response.json({ error: "invalid_message_id" }, { status: 400 });
  }

  const { messageId } = parsed.data;
  const db = getDb();

  const message = await db.query.messagesToArtist.findFirst({
    where: (messageTable, { and: andCondition, eq: eqField, isNull: isNullField }) =>
      andCondition(eqField(messageTable.id, messageId), isNullField(messageTable.deletedAt)),
  });

  if (!message) {
    return Response.json({ error: "message_not_found" }, { status: 404 });
  }

  // INFO: Restrict message deletion to the author.
  if (message.userId !== userId) {
    return new Response("not_allowed", { status: 403 });
  }

  try {
    await db
      .update(messagesToArtist)
      .set({ deletedAt: new Date() })
      .where(eq(messagesToArtist.id, messageId));

    return new Response("ok", { status: 200 });
  } catch {
    return new Response("failed_to_delete_message", { status: 500 });
  }
}
