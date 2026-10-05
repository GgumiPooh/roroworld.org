"use client";

import { useCurrentUser } from "@/entities/user";
import { NicknameChangeOverlay, useAuthOverlay, UserMenuOverlay } from "@/features/auth";
import { LogoIcon } from "@/shared/icons";
import { cn, useBreakpoint, type Nullable } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FC } from "react";
import { useClickAway } from "react-use";

export const HEADER_MENU_LIST = [
  { href: "/activity", label: "Activity" },
  { href: "/albums", label: "Albums" },
  { href: "/gallery", label: "Gallery" },
  { href: "/toArtist", label: "To. RoRo" },
  { href: "/login", label: "Log In" },
] as const;

export type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isUserOverlayOpen, setIsUserOverlayOpen] = useState(false);
  const [isNicknameOverlayOpen, setIsNicknameOverlayOpen] = useState(false);

  const { displayName, isLoading: isUserLoading } = useCurrentUser();

  const headerRef = useRef<Nullable<HTMLDivElement>>(null);

  useClickAway(headerRef, () => {
    setIsHeaderMenuOpen(false);
  });

  useBreakpoint("lg", (isMatch) => {
    if (!isMatch) {
      return;
    }
    setIsHeaderMenuOpen(false);
  });

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "rounded-4xl bg-[#e9d8ce52] px-3 py-1.5 backdrop-blur-sm md:px-6",
          "transition-[max-height] duration-800",
          isHeaderMenuOpen && "max-h-[1000px]",
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button size="sm" variant="icon" onClick={handleToggleHeaderMenu(false)}>
              <LogoIcon className="w-18 shrink-0 pt-0.5 text-[#eee7d5] md:w-25" />
            </Button>
          </Link>

          <DesktopMenuList
            className="hidden lg:flex"
            displayName={displayName}
            isLoading={isUserLoading}
            onUserClick={handleToggleUserOverlay(true)}
          />

          <Button className="lg:hidden" size="sm" variant="icon" onClick={handleToggleHeaderMenu()}>
            <Bars3Icon className="size-9 stroke-2 text-[#eee7d5]" />
          </Button>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-700 ease-in-out",
            "lg:hidden",
            isHeaderMenuOpen
              ? "max-h-[600px] opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <MobileMenuPanel
            className="mt-5 ml-1"
            displayName={displayName}
            isLoading={isUserLoading}
            onNavigate={handleToggleHeaderMenu(false)}
            onUserClick={handleToggleUserOverlay(true)}
          />
        </div>
      </header>

      {isUserOverlayOpen && (
        <UserMenuOverlay
          onClose={handleToggleUserOverlay(false)}
          onNicknameMenuClick={handleToggleNicknameOverlay(true)}
        />
      )}

      {isNicknameOverlayOpen && (
        <NicknameChangeOverlay
          currentNickname={displayName}
          onClose={handleToggleNicknameOverlay(false)}
        />
      )}
    </>
  );

  function handleToggleHeaderMenu(isOpen?: boolean) {
    return () => setIsHeaderMenuOpen((prev) => isOpen ?? !prev);
  }

  function handleToggleUserOverlay(isOpen?: boolean) {
    return () => setIsUserOverlayOpen((prev) => isOpen ?? !prev);
  }

  function handleToggleNicknameOverlay(isOpen?: boolean) {
    return () => setIsNicknameOverlayOpen((prev) => isOpen ?? !prev);
  }
}

type MenuListProps = {
  className?: string;
  displayName?: Nullable<string>;
  isLoading?: boolean;
  onNavigate?: () => void;
  onUserClick?: () => void;
};

const DesktopMenuList: FC<MenuListProps> = ({
  className,
  displayName,
  isLoading,
  onNavigate,
  onUserClick,
}) => {
  const router = useRouter();
  const { open: openAuthOverlay } = useAuthOverlay();

  return (
    <ul className={cn("flex items-center", className)}>
      {HEADER_MENU_LIST.map((item) => (
        <li key={item.href} className="mr-7">
          <Button className="font-bold" size="md" variant="ghost" onClick={handleMenuClick(item)}>
            {item.href === "/login" ? getLoginLabel() : item.label}
          </Button>
        </li>
      ))}
    </ul>
  );

  function handleMenuClick(item: (typeof HEADER_MENU_LIST)[number]) {
    return () => {
      onNavigate?.();

      if (item.href !== "/login") {
        router.push(item.href);
        return;
      }

      if (displayName) {
        onUserClick?.();
        return;
      }

      openAuthOverlay();
    };
  }

  function getLoginLabel() {
    if (isLoading) {
      return ". . .";
    }
    if (displayName) {
      return `${displayName} 님!`;
    }
    return "Log In";
  }
};

const MobileMenuPanel: FC<MenuListProps> = ({
  className,
  displayName,
  isLoading,
  onNavigate,
  onUserClick,
}) => {
  const router = useRouter();
  const { open: openAuthOverlay } = useAuthOverlay();

  return (
    <ul className={cn("", className)}>
      {HEADER_MENU_LIST.map((item) => (
        <li key={item.href} className="mb-3">
          <Button
            className="text-base font-bold text-[#eee7d5]"
            size="sm"
            variant="ghost"
            onClick={handleMenuClick(item)}
          >
            {item.href === "/login" ? getLoginLabel() : item.label}
          </Button>
        </li>
      ))}
    </ul>
  );

  function handleMenuClick(item: (typeof HEADER_MENU_LIST)[number]) {
    return () => {
      onNavigate?.();

      if (item.href !== "/login") {
        router.push(item.href);
        return;
      }

      if (displayName) {
        onUserClick?.();
        return;
      }

      openAuthOverlay();
    };
  }

  function getLoginLabel() {
    if (isLoading) {
      return ". . .";
    }
    if (displayName) {
      return `${displayName} 님!`;
    }
    return "Log In";
  }
};
