import { GlobalProvider } from "@/app/providers";
import "@/app/styles";
import { getEnv } from "@/shared/config";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { PropsWithChildren } from "react";

const siteUrl = getEnv("NEXT_PUBLIC_APP_URL", "https://roroworld.org");
const siteTitle = "RORO WORLD | 한로로(HANRORO) 팬사이트";
const siteDescription =
  "싱어송라이터 한로로(HANRORO) 팬사이트 로로월드입니다! 한로로의 앨범, 곡 정보, 가사, 활동 내역, 갤러리 등 다양한 소식을 만나보세요.";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  applicationName: "RORO WORLD",
  authors: [{ name: "RORO WORLD" }],
  creator: "RORO WORLD",
  description: siteDescription,
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: [
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "/images/favicon.svg",
    },
  ],
  keywords: [
    "한로로",
    "HANRORO",
    "로로월드",
    "RORO WORLD",
    "한로로 팬사이트",
    "싱어송라이터 한로로",
    "한로로 노래",
    "한로로 가사",
    "한로로 앨범",
    "한로로 활동",
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    description: siteDescription,
    images: [
      {
        alt: "RORO WORLD 썸네일",
        height: 630,
        url: "/images/og-thumbnail.png",
        width: 1200,
      },
    ],
    locale: "ko_KR",
    siteName: "RORO WORLD",
    title: {
      default: siteTitle,
      template: "%s | RORO WORLD",
    },
    type: "website",
    url: siteUrl,
  },
  publisher: "RORO WORLD",
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: {
    default: siteTitle,
    template: "%s | RORO WORLD",
  },
  twitter: {
    card: "summary_large_image",
    description: siteDescription,
    images: ["/images/og-thumbnail.png"],
    title: siteTitle,
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
