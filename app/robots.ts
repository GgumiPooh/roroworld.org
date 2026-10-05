import { getEnv } from "@/shared/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getEnv("NEXT_PUBLIC_APP_URL", "https://roroworld.org");

  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/signup-complete", "/oauth2/", "/login/"],
      userAgent: "*",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
