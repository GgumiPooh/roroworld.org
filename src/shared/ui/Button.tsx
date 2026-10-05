import { cn } from "@/shared/lib";
import { type ComponentProps, type PropsWithChildren } from "react";

export type ButtonProps = PropsWithChildren<
  ComponentProps<"button"> & {
    className?: string;
    size?: "lg" | "md" | "sm";
    variant?: "ghost" | "icon" | "primary" | "secondary";
  }
>;

export function Button({
  className,
  children,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-4xl font-medium transition-all focus:outline-none",
        variant === "primary" && "bg-gray-600 text-white hover:bg-gray-500",
        variant === "secondary" &&
          "bg-plum-500/50 text-plum-300 hover:scale-107 hover:bg-plum-500/40 hover:text-plum-300 focus:ring-plum-400 active:scale-95 active:bg-plum-400/60 active:text-plum-300",
        variant === "ghost" &&
          "bg-transparent p-3 text-base text-plum-200 hover:ring-1 hover:ring-plum-300",
        variant === "icon" && "p-0",

        size === "sm" && "px-2 py-1 text-xs",
        size === "md" && "px-4 py-1.5 text-base",
        size === "lg" && "px-8 py-4 text-lg",

        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
