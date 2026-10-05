"use client";

import { BlurBackground } from "@/shared/ui";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { BackgroundContext } from "../model/background-context";
import type { BackgroundState } from "../model/types";

export type MainBackgroundProps = {
  className?: string;
};

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function getDefaultBackground(pathname: string): BackgroundState {
  const normalized = normalizePathname(pathname).toLowerCase();

  if (normalized === "/") {
    return { overlay: false };
  }
  if (normalized === "/activity" || normalized === "/albums") {
    return {
      overlay: true,
      overlayClassName: "bg-gray-400/50",
    };
  }
  if (normalized === "/gallery") {
    return {
      hidden: true,
      overlay: false,
    };
  }
  if (normalized === "/toartist") {
    return {
      imgClassName: "object-cover object-center backdrop-blur-sm",
      overlay: true,
      overlayClassName: "bg-gray-900/70",
      src: "/images/home-banner3.png",
    };
  }
  if (normalized.startsWith("/album/")) {
    return {
      imgClassName: "scale-105 blur-md",
      overlay: true,
      overlayClassName: "bg-gray-800/60",
    };
  }
  return { overlay: false };
}

export function MainBackground({ className }: MainBackgroundProps) {
  const pathname = usePathname() ?? "/";
  const context = useContext(BackgroundContext);
  const pageState = context?.pageState ?? {};

  const defaultConfig = getDefaultBackground(pathname);
  const isAlbumRoute = pathname.startsWith("/album/");

  const resolvedState: BackgroundState = {
    alt: isAlbumRoute ? (pageState.alt ?? defaultConfig.alt) : defaultConfig.alt,
    hidden: pageState.hidden ?? defaultConfig.hidden,
    imgClassName: isAlbumRoute
      ? (pageState.imgClassName ?? defaultConfig.imgClassName)
      : defaultConfig.imgClassName,
    overlay: pageState.overlay ?? defaultConfig.overlay,
    overlayClassName: pageState.overlayClassName ?? defaultConfig.overlayClassName,
    src: isAlbumRoute ? (pageState.src ?? defaultConfig.src) : defaultConfig.src,
  };

  return (
    <BlurBackground
      className={className}
      imgClassName={resolvedState.imgClassName}
      overlayClassName={resolvedState.overlayClassName}
      alt={resolvedState.alt}
      hidden={resolvedState.hidden}
      overlay={resolvedState.overlay}
      src={resolvedState.src}
    />
  );
}
