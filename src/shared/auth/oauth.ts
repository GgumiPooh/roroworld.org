import "server-only";

import { getEnv } from "@/shared/config";
import { getDb, refreshTokens, users } from "@/shared/db";
import { A_DAY, assert } from "@/shared/lib";
import { and, eq } from "drizzle-orm";
import crypto from "node:crypto";
import { generateSecureRandomToken, hashRefreshToken, signAccessToken } from "./token";

export type OAuthProvider = "kakao" | "naver";

type OAuthUserProfile = {
  name: string;
  nickname: string;
  providerId: string;
};

export type OAuthAuthenticationResult = {
  accessToken: string;
  isNewUser: boolean;
  refreshToken: string;
};

export function getOAuthAuthorizationUrl(
  provider: OAuthProvider,
  state: string,
  redirectUri: string,
): string {
  if (provider === "naver") {
    const clientId = getEnv("NAVER_CLIENT_ID", "");
    assert(clientId, "NAVER_CLIENT_ID is not configured");
    const query = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
    });
    return `https://nid.naver.com/oauth2.0/authorize?${query.toString()}`;
  }

  const clientId = getEnv("KAKAO_CLIENT_ID", "");
  assert(clientId, "KAKAO_CLIENT_ID is not configured");
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  return `https://kauth.kakao.com/oauth/authorize?${query.toString()}`;
}

async function fetchNaverProfile(
  code: string,
  state: string,
  redirectUri: string,
): Promise<OAuthUserProfile> {
  const clientId = getEnv("NAVER_CLIENT_ID", "");
  const clientSecret = getEnv("NAVER_CLIENT_SECRET", "");
  assert(clientId && clientSecret, "Naver credentials not configured");

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    state,
  });

  const tokenRes = await fetch(`https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`, {
    method: "POST",
  });
  if (!tokenRes.ok) {
    throw new Error("Failed to exchange Naver token");
  }
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  assert(accessToken, "No access token in Naver response");

  const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) {
    throw new Error("Failed to fetch Naver profile");
  }
  const profileData = (await profileRes.json()) as {
    response?: { name?: string; nickname?: string; id?: string };
  };
  const profile = profileData.response;
  assert(profile?.id, "No id in Naver profile");

  return {
    name: profile.name || profile.nickname || "네이버 사용자",
    nickname: profile.nickname || profile.name || "",
    providerId: profile.id,
  };
}

async function fetchKakaoProfile(code: string, redirectUri: string): Promise<OAuthUserProfile> {
  const clientId = getEnv("KAKAO_CLIENT_ID", "");
  const clientSecret = getEnv("KAKAO_CLIENT_SECRET", "");
  assert(clientId, "Kakao client ID not configured");

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  if (clientSecret) {
    tokenParams.append("client_secret", clientSecret);
  }

  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    body: tokenParams.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  if (!tokenRes.ok) {
    throw new Error("Failed to exchange Kakao token");
  }
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  assert(accessToken, "No access token in Kakao response");

  const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) {
    throw new Error("Failed to fetch Kakao profile");
  }
  const profileData = (await profileRes.json()) as {
    kakao_account?: { profile?: { nickname?: string } };
    properties?: { nickname?: string };
    id?: number | string;
  };
  assert(profileData.id, "No id in Kakao profile");

  const nickname =
    profileData.properties?.nickname || profileData.kakao_account?.profile?.nickname || "";
  return {
    name: nickname || "카카오 사용자",
    nickname,
    providerId: String(profileData.id),
  };
}

export async function exchangeOAuthCodeAndAuthenticate(
  provider: OAuthProvider,
  code: string,
  state: string,
  redirectUri: string,
): Promise<OAuthAuthenticationResult> {
  const profile =
    provider === "naver"
      ? await fetchNaverProfile(code, state, redirectUri)
      : await fetchKakaoProfile(code, redirectUri);

  const db = getDb();

  // INFO: Find existing user by provider and providerId
  const existingUsers = await db
    .select()
    .from(users)
    .where(and(eq(users.provider, provider), eq(users.providerId, profile.providerId)))
    .limit(1);

  let userId: number;
  let userNickname: string;
  let isNewUser = false;

  if (existingUsers.length > 0) {
    const existing = existingUsers[0];
    userId = existing.id;
    userNickname = existing.nickname || existing.name || "사용자";
  } else {
    isNewUser = true;
    let desiredNickname = profile.nickname.trim();
    if (desiredNickname.length < 2) {
      desiredNickname = `${provider}_${crypto.randomInt(1000, 9999)}`;
    }

    // INFO: Ensure nickname uniqueness
    const duplicateCheck = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.nickname, desiredNickname))
      .limit(1);

    if (duplicateCheck.length > 0) {
      desiredNickname = `${desiredNickname}_${crypto.randomInt(100, 999)}`;
    }

    const inserted = await db
      .insert(users)
      .values({
        name: profile.name,
        nickname: desiredNickname,
        provider,
        providerId: profile.providerId,
      })
      .returning();

    userId = inserted[0].id;
    userNickname = inserted[0].nickname || inserted[0].name || "사용자";
  }

  const accessToken = await signAccessToken(userId, userNickname);
  const refreshToken = generateSecureRandomToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * A_DAY);

  await db.insert(refreshTokens).values({
    expiresAt,
    revoked: false,
    tokenHash,
    userId,
  });

  return {
    accessToken,
    isNewUser,
    refreshToken,
  };
}
