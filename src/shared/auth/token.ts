import "server-only";

import { getEnv } from "@/shared/config";
import { A_DAY, A_SECOND, AN_HOUR, type Nullable } from "@/shared/lib";
import { jwtVerify, SignJWT } from "jose";
import crypto from "node:crypto";

export type AuthTokenPayload = {
  name: string;
  userId: number;
};

// INFO: Fallback dev secret ensures the build and tests succeed without requiring JWT_SECRET.
const JWT_DEV_FALLBACK = "roroworld-development-jwt-secret-key-32-chars-min";

function getJwtSigningKey(): Uint8Array {
  const secret = getEnv("JWT_SECRET", JWT_DEV_FALLBACK);
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(userId: number, name = ""): Promise<string> {
  const key = getJwtSigningKey();
  const ttlSeconds = AN_HOUR / A_SECOND;

  return new SignJWT({ name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(key);
}

export async function verifyAccessToken(token: string): Promise<Nullable<AuthTokenPayload>> {
  try {
    const key = getJwtSigningKey();
    const { payload } = await jwtVerify(token, key);

    if (!payload.sub) {
      return null;
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId)) {
      return null;
    }

    const name = typeof payload.name === "string" ? payload.name : "";

    return {
      name,
      userId,
    };
  } catch {
    return null;
  }
}

export function generateSecureRandomToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashRefreshToken(tokenPlain: string): string {
  return crypto.createHash("sha256").update(tokenPlain).digest("hex");
}

export function getRefreshTokenTtlSeconds(): number {
  return (30 * A_DAY) / A_SECOND;
}
