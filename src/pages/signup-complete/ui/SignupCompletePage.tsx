"use client";

import { useCurrentUser } from "@/entities/user";
import { cn } from "@/shared/lib";
import { BlurBackground, Button } from "@/shared/ui";
import { useRouter } from "next/navigation";

export type SignupCompletePageProps = {
  className?: string;
};

const CONSENT_KEY = "privacyConsent";

function saveConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, "true");
  } catch {
    // INFO: Silently ignore when localStorage is unavailable (e.g. private browsing)
  }
}

export function SignupCompletePage({ className }: SignupCompletePageProps) {
  const router = useRouter();
  const { refetch } = useCurrentUser();

  function handleAgree() {
    saveConsent();
    refetch();
    router.push("/");
  }

  return (
    <div className={cn("relative flex min-h-dvh items-center justify-center", className)}>
      <BlurBackground overlayClassName="bg-gray-900/70" overlay />

      <div className="z-10 mx-4 w-full max-w-md rounded-3xl bg-gray-800/90 p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-xl font-bold text-plum-100">
          개인정보 수집 및 이용 동의
        </h1>

        <div className="mb-6 max-h-60 overflow-y-auto rounded-lg bg-gray-900/50 p-4 text-left text-sm text-plum-200">
          <p className="mb-3 font-semibold">1. 수집하는 개인정보 항목</p>
          <p className="mb-4 text-plum-300">- 소셜 로그인 시: 이름, 닉네임</p>

          <p className="mb-3 font-semibold">2. 수집 및 이용 목적</p>
          <p className="mb-4 text-plum-300">
            - 서비스 이용을 위한 회원 식별
            <br />- 댓글 작성 및 관리
          </p>

          <p className="mb-3 font-semibold">3. 보유 및 이용 기간</p>
          <p className="text-plum-300">- 회원 탈퇴 시까지</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="md" variant="primary" onClick={handleAgree}>
            동의하고 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
