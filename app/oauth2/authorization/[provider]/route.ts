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

export async function GET(req: Request, context: RouteContext): Promise<Response> {
  const rawParams = await context.params;
  const parsed = providerSchema.safeParse(rawParams.provider);

  if (!parsed.success) {
    return Response.json({ error: "unsupported_oauth_provider" }, { status: 400 });
  }

  const provider = parsed.data as OAuthProvider;
  const state = generateSecureRandomToken();
  const origin = getBaseOrigin(req);
  const redirectUri = `${origin}/login/oauth2/code/${provider}`;

  try {
    const authUrl = getOAuthAuthorizationUrl(provider, state, redirectUri);
    const isProduction = process.env.NODE_ENV === "production";
    const secureSuffix = isProduction ? "; Secure" : "";

    const headers = new Headers();
    // INFO: Store state in a short-lived cookie for CSRF validation during callback
    headers.append(
      "Set-Cookie",
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300${secureSuffix}`,
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
