import { cn, isMobile } from "@/shared/lib";
import { ImageWithPlaceholder } from "./ImageWithPlaceholder";

export type BlurBackgroundProps = {
  className?: string;
  imgClassName?: string;
  overlayClassName?: string;
  alt?: string;
  overlay?: boolean;
  src?: string;
};

export function BlurBackground({
  className,
  imgClassName = "",
  overlayClassName = "bg-gray-400/50",
  alt = "background",
  overlay = false,
  src,
}: BlurBackgroundProps) {
  const resolvedSrc =
    src ?? (isMobile() ? "/images/home-banner7.webp" : "/images/home-banner9.webp");

  return (
    <div className={className}>
      <ImageWithPlaceholder
        className="fixed inset-0 -z-2 h-dvh w-full"
        imgClassName={cn("object-cover object-center", imgClassName)}
        alt={alt}
        src={resolvedSrc}
      />
      {overlay && <div className={cn("fixed inset-0 -z-1", overlayClassName)} />}
    </div>
  );
}
