import { getAuthenticatedUserId } from "@/shared/auth";
import { getDb, messagesToArtist } from "@/shared/db";
import { formatDisplayDate } from "@/shared/lib";
import { z } from "zod";

const bodySchema = z.object({
  content: z.string().trim().min(1, "content is required"),
});

export async function GET(): Promise<Response> {
  const db = getDb();

  const messageList = await db.query.messagesToArtist.findMany({
    orderBy: (messageTable, { desc }) => [desc(messageTable.messagedAt)],
    where: (messageTable, { isNull }) => isNull(messageTable.deletedAt),
    with: {
      user: true,
    },
  });

  const responseList = messageList.map((message) => {
    const authorName = message.user?.nickname || "익명";
    const createdAtStr = formatDisplayDate(message.messagedAt);

    return {
      author: authorName,
      authorName,
      content: message.content,
      createdAt: createdAtStr,
      id: message.id,
    };
  });

  return Response.json(responseList);
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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  const { content } = parsed.data;
  const db = getDb();

  try {
    const [inserted] = await db
      .insert(messagesToArtist)
      .values({
        content,
        userId,
      })
      .returning();

    const user = await db.query.users.findFirst({
      where: (userTable, { eq }) => eq(userTable.id, userId),
    });

    const authorName = user?.nickname || "익명";
    const createdAtStr = formatDisplayDate(inserted.messagedAt);

    return Response.json({
      author: authorName,
      authorName,
      content: inserted.content,
      createdAt: createdAtStr,
      id: inserted.id,
    });
  } catch {
    return new Response("failed_to_save_message", { status: 500 });
  }
}
