"use client";

import { assert, cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { Portal } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEvent } from "react-use";

export type UserMenuOverlayProps = {
  className?: string;
  isOpen?: boolean;
  onClose: () => void;
  onNicknameMenuClick: () => void;
};

export function UserMenuOverlay({
  className,
  isOpen = true,
  onClose,
  onNicknameMenuClick,
}: UserMenuOverlayProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

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

  function handleNicknameClick() {
    onClose();
    onNicknameMenuClick();
  }

  async function handleLogout() {
    localStorage.removeItem("currentUser");
    queryClient.setQueryData(["currentUser"], null);

    try {
      await fetch("/api/auth/logout", {
        credentials: "include",
        method: "POST",
      });
      alert("로그아웃이 완료되었습니다.");
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      onClose();
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "정말 회원탈퇴 하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.",
    );
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch("/api/auth/delete", {
        credentials: "include",
        method: "DELETE",
      });
      assert(res.ok, "회원 탈퇴 실패");

      localStorage.removeItem("currentUser");
      localStorage.removeItem("privacyConsent");
      queryClient.setQueryData(["currentUser"], null);
      alert("회원탈퇴가 완료되었습니다.");
      router.push("/");
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      alert("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <Portal>
      <div className={cn("fixed inset-0 z-50", className)}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative mx-auto mt-40 w-[min(90vw,280px)] rounded-4xl bg-gray-800/70 py-5 shadow-xl">
          <h2 className="mb-5 border-b border-gray-400 py-3 text-center text-xl font-bold text-plum-100">
            메뉴
          </h2>

          <div className="mb-3 space-y-3">
            <Button
              className="w-full py-3 text-plum-200 md:text-xl"
              size="md"
              variant="icon"
              onClick={handleNicknameClick}
            >
              닉네임 변경
            </Button>
            <Button
              className="w-full py-3 text-plum-200 md:text-xl"
              size="md"
              variant="icon"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
            <Button
              className="w-full py-3 text-xl text-plum-600"
              size="md"
              variant="icon"
              onClick={handleDeleteAccount}
            >
              회원 탈퇴
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
