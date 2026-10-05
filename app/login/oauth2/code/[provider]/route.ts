import {
  exchangeOAuthCodeAndAuthenticate,
  readCookie,
  setAuthCookies,
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

export async function GET(req: Request, context: RouteContext): Promise<Response> {
  const rawParams = await context.params;
  const parsedProvider = providerSchema.safeParse(rawParams.provider);

  if (!parsedProvider.success) {
    return Response.json({ error: "unsupported_oauth_provider" }, { status: 400 });
  }

  const provider = parsedProvider.data as OAuthProvider;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  const origin = getBaseOrigin(req);

  if (!code) {
    const error = url.searchParams.get("error") || "missing_code";
    return Response.redirect(`${origin}/?oauth2_error=${encodeURIComponent(error)}`, 302);
  }

  // INFO: Optionally verify state with the oauth_state cookie for Naver CSRF protection
  const savedState = readCookie(req, "oauth_state");
  if (provider === "naver" && savedState && savedState !== state) {
    return Response.redirect(`${origin}/?oauth2_error=state_mismatch`, 302);
  }

  const redirectUri = `${origin}/login/oauth2/code/${provider}`;

  try {
    const result = await exchangeOAuthCodeAndAuthenticate(provider, code, state, redirectUri);

    const headers = new Headers();
    setAuthCookies(headers, result.accessToken, result.refreshToken);

    // INFO: Clear the temporary state cookie
    const isProduction = process.env.NODE_ENV === "production";
    const secureSuffix = isProduction ? "; Secure" : "";
    headers.append(
      "Set-Cookie",
      `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureSuffix}`,
    );

    const targetUrl = result.isNewUser ? `${origin}/signup-complete` : `${origin}/`;
    headers.set("Location", targetUrl);

    return new Response(null, {
      headers,
      status: 302,
    });
  } catch {
    return Response.redirect(`${origin}/?oauth2_error=authentication_failed`, 302);
  }
}
