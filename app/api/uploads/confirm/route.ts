import { getAuthenticatedUserId } from "@/shared/auth";
import { checkObjectExists, getR2PublicUrl } from "@/shared/lib/r2";
import { z } from "zod";

const confirmSchema = z.object({
  objectKey: z.string().min(1),
});

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

  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request_body" }, { status: 400 });
  }

  const { objectKey } = parsed.data;

  // INFO: Prevent cross-user confirming by enforcing directory prefix check.
  if (!objectKey.startsWith(`gallery/${userId}/`)) {
    return new Response("forbidden", { status: 403 });
  }

  const exists = await checkObjectExists(objectKey);
  if (!exists) {
    return new Response("file_not_found", { status: 400 });
  }

  const fileUrl = getR2PublicUrl(objectKey);

  return Response.json({
    confirmed: true,
    publicUrl: fileUrl,
    url: fileUrl,
  });
}
