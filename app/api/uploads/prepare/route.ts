import { getAuthenticatedUserId } from "@/shared/auth";
import { generatePresignedUploadUrl, getR2PublicUrl } from "@/shared/lib/r2";
import crypto from "node:crypto";
import { z } from "zod";

const prepareSchema = z.object({
  filename: z.string().optional(),
  mimeType: z.string().min(1),
});

function getFileExtension(filename?: string): string {
  if (!filename || !filename.includes(".")) {
    return "";
  }
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
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

  const parsed = prepareSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request_body" }, { status: 400 });
  }

  const { filename, mimeType } = parsed.data;
  const ext = getFileExtension(filename);
  const objectKey = `gallery/${userId}/${crypto.randomUUID()}${ext}`;

  try {
    const presignedUrl = await generatePresignedUploadUrl(objectKey, mimeType);
    const publicUrl = getR2PublicUrl(objectKey);

    return Response.json({
      objectKey,
      presignedUrl,
      publicUrl,
    });
  } catch {
    return Response.json({ error: "presign_failed" }, { status: 500 });
  }
}
