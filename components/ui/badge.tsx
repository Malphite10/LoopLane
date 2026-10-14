import type { HTMLAttributes } from "react";

type Variant = "default" | "secondary" | "outline" | "success";

export function Badge({
  variant = "secondary",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return <span className={`badge badge-${variant} ${className}`} {...props} />;
}

export function BadgeDot({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`badge-dot ${className}`} aria-hidden="true" {...props} />;
}
