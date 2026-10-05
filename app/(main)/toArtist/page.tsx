import { ToArtistPage } from "@/pages/to-artist";
import { createBreadcrumbSchema, createWebPageSchema } from "@/shared/lib";
import { JsonLd } from "@/shared/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/toArtist",
  },
  description:
    "싱어송라이터 한로로(HANRORO)에게 전하는 팬들의 응원 메시지 공간입니다. 따뜻한 한마디를 남겨보세요.",
  openGraph: {
    description:
      "싱어송라이터 한로로(HANRORO)에게 전하는 팬들의 응원 메시지 공간입니다. 따뜻한 한마디를 남겨보세요.",
    title: "To. 한로로 | RORO WORLD",
    url: "/toArtist",
  },
  title: "To. 한로로",
};

export default function Page() {
  const schemas = [
    createWebPageSchema(
      "To. 한로로 (응원 메시지)",
      "싱어송라이터 한로로(HANRORO)에게 전하는 팬들의 응원 메시지 공간",
      "/toArtist",
    ),
    createBreadcrumbSchema([
      { item: "/", name: "홈" },
      { item: "/toArtist", name: "To. 한로로" },
    ]),
  ];

  return (
    <>
      <JsonLd schema={schemas} />
      <ToArtistPage />
    </>
  );
}
