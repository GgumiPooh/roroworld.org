"use client";

import { cn, type Nullable } from "@/shared/lib";
import { Button, ImageWithPlaceholder } from "@/shared/ui";
import { Portal } from "@headlessui/react";
import { useEvent } from "react-use";

export type LoginOverlayProps = {
  className?: string;
  isOpen?: boolean;
  onClose: () => void;
};

function getOAuthRedirectUrl(provider: "kakao" | "naver"): Nullable<string> {
  if (provider === "naver") {
    return process.env.NEXT_PUBLIC_NAVER_OAUTH_URL || "/oauth2/authorization/naver";
  }
  if (provider === "kakao") {
    return process.env.NEXT_PUBLIC_KAKAO_OAUTH_URL || "/oauth2/authorization/kakao";
  }
  return null;
}

export function LoginOverlay({ className, isOpen = true, onClose }: LoginOverlayProps) {
  useEvent("keydown", (e: KeyboardEvent) => {
    if (e.isComposing) {
      return;
    }
    if (e.key === "Escape") {
      onClose();
    }
  });

  if (!isOpen) {
    return null;
  }

  function handleRedirect(provider: "kakao" | "naver") {
    return () => {
      const redirectUrl = getOAuthRedirectUrl(provider);
      if (!redirectUrl) {
        window.alert("OAuth URL이 설정되지 않았습니다. 환경변수를 확인해주세요.");
        return;
      }
      window.location.assign(redirectUrl);
    };
  }

  return (
    <Portal>
      <div className={cn("fixed inset-0 z-[100]", className)}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative mx-auto mt-40 w-[min(90vw,420px)] rounded-4xl bg-gray-800/80 p-10 text-center shadow-xl">
          <h2 className="mb-10 text-xl font-bold text-plum-300">로그인</h2>
          <div className="space-y-3">
            <Button
              className="w-full hover:scale-100"
              size="sm"
              variant="icon"
              onClick={handleRedirect("naver")}
            >
              <ImageWithPlaceholder className="w-full" alt="Naver" src="/images/naver-login.png" />
            </Button>
            <Button
              className="w-full hover:scale-100"
              size="sm"
              variant="icon"
              onClick={handleRedirect("kakao")}
            >
              <ImageWithPlaceholder className="w-full" alt="Kakao" src="/images/kakao-login.png" />
            </Button>
          </div>
          <Button className="mt-5" size="md" variant="ghost" onClick={onClose}>
            취소
          </Button>
        </div>
      </div>
    </Portal>
  );
}
