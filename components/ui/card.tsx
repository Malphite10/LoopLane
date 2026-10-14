import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={className} {...props} />;
}

export function FeatureIcon({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`feature-icon ${className}`} aria-hidden="true" {...props} />;
}
