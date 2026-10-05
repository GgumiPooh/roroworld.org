import { cn } from "@/shared/lib";

export type BlogIconProps = {
  className?: string;
};

export function BlogIcon({ className }: BlogIconProps) {
  return (
    <svg
      className={cn("fill-current", className)}
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M344.06 286.98c-70.27 0-135.39 22.03-188.86 59.55V70.18H0v858.3h155.2v-42.62c53.47 37.51 118.59 59.55 188.86 59.55 181.82 0 329.21-147.39 329.21-329.21s-147.4-329.22-329.21-329.22zm-14.78 514.64c-99.13 0-179.49-83.08-179.49-185.56S230.15 430.5 329.28 430.5s179.49 83.08 179.49 185.56-80.36 185.56-179.49 185.56zM862.35 0h62.08v1000h-62.08z" />
    </svg>
  );
}
