import { cn, isMobile } from "@/shared/lib";
import { ImageWithPlaceholder } from "./ImageWithPlaceholder";

export type BlurBackgroundProps = {
  className?: string;
  imgClassName?: string;
  overlayClassName?: string;
  alt?: string;
  hidden?: boolean;
  overlay?: boolean;
  src?: string;
};

export function BlurBackground({
  className,
  imgClassName = "",
  overlayClassName = "bg-gray-400/50",
  alt = "background",
  hidden = false,
  overlay = false,
  src,
}: BlurBackgroundProps) {
  const resolvedSrc =
    src ?? (isMobile() ? "/images/home-banner7.webp" : "/images/home-banner9.webp");

  return (
    <div className={cn(hidden && "hidden", className)}>
      <ImageWithPlaceholder
        className="fixed inset-0 -z-2 h-dvh w-full"
        imgClassName={cn("object-cover object-center", imgClassName)}
        alt={alt}
        renderPlaceholder={() => null}
        src={resolvedSrc}
      />
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-1 transition-all duration-300",
          overlayClassName,
          overlay ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
