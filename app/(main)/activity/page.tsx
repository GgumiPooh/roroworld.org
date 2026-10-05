import { ActivityPage } from "@/pages/activity";
import { createBreadcrumbSchema, createCollectionPageSchema } from "@/shared/lib";
import { JsonLd } from "@/shared/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/activity",
  },
  description:
    "싱어송라이터 한로로(HANRORO)의 공연, 앨범 발매, 페스티벌, 수상 등 공식 활동 타임라인을 확인하세요.",
  openGraph: {
    description:
      "싱어송라이터 한로로(HANRORO)의 공연, 앨범 발매, 페스티벌, 수상 등 공식 활동 타임라인을 확인하세요.",
    title: "활동 내역 | RORO WORLD",
    url: "/activity",
  },
  title: "활동 내역",
};

export default function Page() {
  const schemas = [
    createCollectionPageSchema(
      "한로로 활동 내역",
      "싱어송라이터 한로로(HANRORO)의 공연, 앨범 발매, 페스티벌, 수상 등 공식 활동 기록 타임라인",
      "/activity",
    ),
    createBreadcrumbSchema([
      { item: "/", name: "홈" },
      { item: "/activity", name: "활동 내역" },
    ]),
  ];

  return (
    <>
      <JsonLd schema={schemas} />
      <ActivityPage />
    </>
  );
}
