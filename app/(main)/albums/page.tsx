import { AlbumsPage } from "@/pages/albums";
import { createBreadcrumbSchema, createCollectionPageSchema } from "@/shared/lib";
import { JsonLd } from "@/shared/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/albums",
  },
  description:
    "싱어송라이터 한로로(HANRORO)의 디스코그래피 목록입니다. 정규 앨범, EP, 싱글 및 수록곡 정보를 확인하세요.",
  openGraph: {
    description:
      "싱어송라이터 한로로(HANRORO)의 디스코그래피 목록입니다. 정규 앨범, EP, 싱글 및 수록곡 정보를 확인하세요.",
    title: "앨범 | RORO WORLD",
    url: "/albums",
  },
  title: "앨범",
};

export default function Page() {
  const schemas = [
    createCollectionPageSchema(
      "한로로 앨범 목록",
      "싱어송라이터 한로로(HANRORO)의 발매 앨범 및 디스코그래피 목록",
      "/albums",
    ),
    createBreadcrumbSchema([
      { item: "/", name: "홈" },
      { item: "/albums", name: "앨범" },
    ]),
  ];

  return (
    <>
      <JsonLd schema={schemas} />
      <AlbumsPage />
    </>
  );
}
