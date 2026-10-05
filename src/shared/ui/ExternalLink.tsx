import { type PropsWithChildren } from "react";

export type ExternalLinkProps = PropsWithChildren<{
  className?: string;
  ariaLabel?: string;
  href: string;
}>;

export function ExternalLink({ className, ariaLabel, children, href }: ExternalLinkProps) {
  return (
    <a
      className={className}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
