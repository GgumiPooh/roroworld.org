import { HomePage } from "@/pages/home";
import { createArtistSchema, createWebsiteSchema } from "@/shared/lib";
import { JsonLd } from "@/shared/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description:
    "싱어송라이터 한로로(HANRORO) 팬사이트 로로월드입니다! 한로로의 디스코그래피, 가사, 활동 기록, 팬 갤러리 소식을 만나보세요.",
  openGraph: {
    description:
      "싱어송라이터 한로로(HANRORO) 팬사이트 로로월드입니다! 한로로의 디스코그래피, 가사, 활동 기록, 팬 갤러리 소식을 만나보세요.",
    title: "RORO WORLD | 한로로(HANRORO) 팬사이트",
    url: "/",
  },
  title: "RORO WORLD | 한로로(HANRORO) 팬사이트",
};

export default function Page() {
  const schemas = [createWebsiteSchema(), createArtistSchema()];

  return (
    <>
      <JsonLd schema={schemas} />
      <HomePage />
    </>
  );
}
