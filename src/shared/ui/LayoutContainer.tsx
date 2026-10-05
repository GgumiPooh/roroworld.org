import { cn } from "@/shared/lib";
import { type PropsWithChildren } from "react";

export type LayoutContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function LayoutContainer({ className, children }: LayoutContainerProps) {
  return <div className={cn("mx-auto max-w-[1920px] px-5", className)}>{children}</div>;
}
