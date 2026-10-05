import {
  generateSecureRandomToken,
  getOAuthAuthorizationUrl,
  type OAuthProvider,
} from "@/shared/auth";
import { z } from "zod";

const providerSchema = z.enum(["kakao", "naver"]);

type RouteContext = {
  params: Promise<{ provider: string }>;
};

function getBaseOrigin(req: Request): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host") || "localhost:5173";
  const proto =
    req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function getOAuthRedirectUri(provider: OAuthProvider, req: Request): string {
  const configuredBase = process.env.OAUTH_REDIRECT_BASE_URL?.trim();
  if (configuredBase) {
    return `${configuredBase.replace(/\/+$/, "")}/login/oauth2/code/${provider}`;
  }
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    // INFO: Defaults to api.roroworld.org to preserve existing Naver/Kakao developer console registration
    return `https://api.roroworld.org/login/oauth2/code/${provider}`;
  }
  const origin = getBaseOrigin(req);
  return `${origin}/login/oauth2/code/${provider}`;
}

export async function GET(req: Request, context: RouteContext): Promise<Response> {
  const rawParams = await context.params;
  const parsed = providerSchema.safeParse(rawParams.provider);

  if (!parsed.success) {
    return Response.json({ error: "unsupported_oauth_provider" }, { status: 400 });
  }

  const provider = parsed.data as OAuthProvider;
  const state = generateSecureRandomToken();
  const redirectUri = getOAuthRedirectUri(provider, req);

  try {
    const authUrl = getOAuthAuthorizationUrl(provider, state, redirectUri);
    const isProduction = process.env.NODE_ENV === "production";
    const secureSuffix = isProduction ? "; Secure" : "";
    const cookieDomain =
      process.env.COOKIE_DOMAIN?.trim() || (isProduction ? ".roroworld.org" : "");
    const domainSuffix = cookieDomain ? `; Domain=${cookieDomain}` : "";

    const headers = new Headers();
    // INFO: Store state in a short-lived cookie for CSRF validation during callback
    headers.append(
      "Set-Cookie",
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300${secureSuffix}${domainSuffix}`,
    );
    headers.set("Location", authUrl);

    return new Response(null, {
      headers,
      status: 302,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "oauth_configuration_error";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
