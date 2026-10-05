import { GlobalProvider } from "@/app/providers";
import "@/app/styles";
import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "한로로 월드 (HANRORO WORLD)",
  description: "아티스트 한로로의 디스코그래피, 활동 기록, 그리고 팬 갤러리",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <body>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
