import { GalleryPage } from "@/pages/gallery";
import { createBreadcrumbSchema, createCollectionPageSchema } from "@/shared/lib";
import { JsonLd } from "@/shared/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/gallery",
  },
  description:
    "싱어송라이터 한로로(HANRORO)의 사진 및 팬 갤러리입니다. 공연, 화보, 일상 사진을 확인하고 감상해보세요.",
  openGraph: {
    description:
      "싱어송라이터 한로로(HANRORO)의 사진 및 팬 갤러리입니다. 공연, 화보, 일상 사진을 확인하고 감상해보세요.",
    title: "갤러리 | RORO WORLD",
    url: "/gallery",
  },
  title: "갤러리",
};

export default function Page() {
  const schemas = [
    createCollectionPageSchema(
      "한로로 팬 갤러리",
      "싱어송라이터 한로로(HANRORO)의 공연, 화보, 일상 사진 갤러리",
      "/gallery",
    ),
    createBreadcrumbSchema([
      { item: "/", name: "홈" },
      { item: "/gallery", name: "갤러리" },
    ]),
  ];

  return (
    <>
      <JsonLd schema={schemas} />
      <GalleryPage />
    </>
  );
}
