import "server-only";

import { A_DAY, A_SECOND, AN_HOUR, type Nullable } from "@/shared/lib";

import { type AuthTokenPayload, verifyAccessToken } from "./token";

function parseCookieValue(cookieHeader: Nullable<string>, name: string): Nullable<string> {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }

  return null;
}

export async function getAuthenticatedUser(req: Request): Promise<Nullable<AuthTokenPayload>> {
  const cookieHeader = req.headers.get("cookie");
  const tokenFromCookie = parseCookieValue(cookieHeader, "access_token");

  if (tokenFromCookie) {
    const verified = await verifyAccessToken(tokenFromCookie);
    if (verified) {
      return verified;
    }
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const tokenFromAuth = authHeader.slice(7).trim();
    return verifyAccessToken(tokenFromAuth);
  }

  return null;
}

export async function getAuthenticatedUserId(req: Request): Promise<Nullable<number>> {
  const authUser = await getAuthenticatedUser(req);
  return authUser ? authUser.userId : null;
}

function getCookieDomainSuffix(): string {
  const customDomain = process.env.COOKIE_DOMAIN?.trim();
  if (customDomain) {
    return `; Domain=${customDomain}`;
  }
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction ? "; Domain=.roroworld.org" : "";
}

export function setAuthCookies(
  resHeaders: Headers,
  accessToken: string,
  refreshToken?: string,
): void {
  // INFO: In production, mark cookies Secure for HTTPS transport protection.
  const isProduction = process.env.NODE_ENV === "production";
  const secureSuffix = isProduction ? "; Secure" : "";
  const domainSuffix = getCookieDomainSuffix();

  const accessMaxAge = AN_HOUR / A_SECOND;
  resHeaders.append(
    "Set-Cookie",
    `access_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${accessMaxAge}${secureSuffix}${domainSuffix}`,
  );

  if (refreshToken) {
    const refreshMaxAge = (30 * A_DAY) / A_SECOND;
    resHeaders.append(
      "Set-Cookie",
      `refresh_token=${refreshToken}; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=${refreshMaxAge}${secureSuffix}${domainSuffix}`,
    );
  }
}

export function clearAuthCookies(resHeaders: Headers): void {
  const isProduction = process.env.NODE_ENV === "production";
  const secureSuffix = isProduction ? "; Secure" : "";
  const domainSuffix = getCookieDomainSuffix();

  resHeaders.append(
    "Set-Cookie",
    `access_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureSuffix}${domainSuffix}`,
  );
  resHeaders.append(
    "Set-Cookie",
    `refresh_token=; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=0${secureSuffix}${domainSuffix}`,
  );
  resHeaders.append(
    "Set-Cookie",
    `JSESSIONID=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureSuffix}${domainSuffix}`,
  );
}

export function readCookie(req: Request, name: string): Nullable<string> {
  const cookieHeader = req.headers.get("cookie");
  return parseCookieValue(cookieHeader, name);
}
