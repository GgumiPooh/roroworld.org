"use client";

import { cn } from "@/shared/lib";
import { PhotoIcon } from "@heroicons/react/24/outline";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import { Skeleton } from "./Skeleton";

export const IMAGE_STATUS = {
  FAILED: "failed",
  LOADED: "loaded",
  LOADING: "loading",
} as const;

export type ImageStatus = (typeof IMAGE_STATUS)[keyof typeof IMAGE_STATUS];

export type ImageWithPlaceholderProps = {
  className?: string;
  imgClassName?: string;
  fallbackOnError?: boolean;
  fallbackSrc?: string;
  renderPlaceholder?: () => ReactNode;
  renderFallback?: () => ReactNode;
  onStatusChange?: (status: ImageStatus) => void;
} & Omit<ComponentProps<"img">, "onError" | "onLoad" | "onLoadStart">;

function isValidImage(img: HTMLImageElement): boolean {
  return img.naturalWidth > 0 && img.naturalHeight > 0;
}

export function ImageWithPlaceholder({
  className,
  imgClassName,
  alt,
  fallbackOnError = true,
  fallbackSrc,
  renderPlaceholder = () => <Skeleton className="size-full rounded-[inherit]" />,
  renderFallback,
  src: sourceProp,
  onStatusChange,
  ...props
}: ImageWithPlaceholderProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  const [currentSrc, setCurrentSrc] = useState(sourceProp);
  const [status, setStatus] = useState<ImageStatus>(IMAGE_STATUS.LOADING);

  useIsomorphicLayoutEffect(() => {
    setCurrentSrc(sourceProp);
    setStatus(IMAGE_STATUS.LOADING);
    onStatusChange?.(IMAGE_STATUS.LOADING);
  }, [sourceProp]);

  const handleLoad = useCallback(() => {
    setStatus(IMAGE_STATUS.LOADED);
    onStatusChange?.(IMAGE_STATUS.LOADED);
  }, [onStatusChange]);

  const handleError = useCallback(() => {
    if (fallbackOnError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setStatus(IMAGE_STATUS.LOADING);
      onStatusChange?.(IMAGE_STATUS.LOADING);
      return;
    }

    setStatus(IMAGE_STATUS.FAILED);
    onStatusChange?.(IMAGE_STATUS.FAILED);
  }, [currentSrc, fallbackOnError, fallbackSrc, onStatusChange]);

  useEffect(() => {
    if (!imgRef.current?.complete) {
      return;
    }

    // INFO: HTMLImageElement.complete can be true when the src value is falsy or failed to load, so double-check.
    if (!isValidImage(imgRef.current)) {
      handleError();
      return;
    }

    handleLoad();
  }, [currentSrc, fallbackSrc, handleError, handleLoad]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {status === IMAGE_STATUS.LOADING && (
        <div className="absolute inset-0">{renderPlaceholder?.()}</div>
      )}

      {status === IMAGE_STATUS.FAILED && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/40 text-gray-500">
          {renderFallback ? renderFallback() : <PhotoIcon className="size-6 text-gray-500/70" />}
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={currentSrc?.toString()}
        ref={imgRef}
        className={cn(
          "size-full transition-opacity duration-500 ease-out",
          status !== IMAGE_STATUS.LOADED && "opacity-0",
          imgClassName,
        )}
        alt={alt}
        src={currentSrc}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
}
