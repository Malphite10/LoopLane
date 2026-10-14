import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  size,
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm";
}) {
  const classes = ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : "", className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classes} {...props} />;
}
