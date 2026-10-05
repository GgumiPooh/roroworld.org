import { GlobalProvider } from "@/app/providers";
import "@/app/styles";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://roroworld.org"),
  title: "RORO WORLD (한)로로월드 팬사이트",
  description:
    "싱어송라이터 한로로(HANRORO) 팬사이트 로로월드입니다! 한로로와 관련된 다양한 정보를 제공합니다. 놀러오세요.",
  icons: [
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "/images/favicon.svg",
    },
  ],
  openGraph: {
    description:
      "싱어송라이터 한로로(HANRORO) 팬사이트 로로월드입니다! 한로로와 관련된 다양한 정보를 제공합니다. 놀러오세요.",
    images: [
      {
        alt: "RORO WORLD 썸네일",
        url: "/images/og-thumbnail.png",
      },
    ],
    siteName: "RORO WORLD",
    title: "RORO WORLD (한)로로월드 팬사이트",
    type: "website",
    url: "https://roroworld.org",
  },
  verification: {
    google: "efZ3uVHPnQetiMRGIGpv8sqdaUsiPvGLO9zcqi0941M",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <body>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-FQ5WF0RW90"
          strategy="afterInteractive"
        />
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
