import "server-only";

import { getEnv } from "@/shared/config";
import { A_MINUTE, A_SECOND, type Optional } from "@/shared/lib";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

declare global {
  var __r2Client: Optional<S3Client>;
}

function getR2Client(): S3Client {
  if (globalThis.__r2Client) {
    return globalThis.__r2Client;
  }

  const accountId = getEnv("R2_ACCOUNT_ID", "dummy-account-id");
  const accessKeyId = getEnv("R2_ACCESS_KEY_ID", "dummy-access-key-id");
  const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY", "dummy-secret-access-key");

  // INFO: Cloudflare R2 endpoint uses the Cloudflare account ID.
  const client = new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  });

  globalThis.__r2Client = client;

  return client;
}

export function getR2BucketName(): string {
  return getEnv("R2_BUCKET_NAME", "roro-world");
}

export function getR2PublicUrl(objectKey: string): string {
  const publicBase = getEnv("R2_PUBLIC_URL", "https://pub-dummy.r2.dev").replace(/\/+$/, "");
  const cleanKey = objectKey.replace(/^\/+/, "");
  return `${publicBase}/${cleanKey}`;
}

export async function generatePresignedUploadUrl(
  objectKey: string,
  mimeType: string,
): Promise<string> {
  const client = getR2Client();
  const bucket = getR2BucketName();
  const command = new PutObjectCommand({
    Bucket: bucket,
    ContentType: mimeType,
    Key: objectKey,
  });

  const expiresInSeconds = (10 * A_MINUTE) / A_SECOND;
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function checkObjectExists(objectKey: string): Promise<boolean> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}
