import { SignupCompletePage } from "@/pages/signup-complete";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "회원가입 완료",
};

export default function Page() {
  return <SignupCompletePage />;
}
