import * as React from "react";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-transparent bg-[#1a1714] text-white",
  secondary: "border-transparent bg-[#f1f1f1] text-black",
  outline: "border-[#e8e8e8] bg-transparent text-[#1a1714]",
  destructive: "border-transparent bg-[#dc2626] text-white",
};

const baseStyles =
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-none whitespace-nowrap shrink-0 transition-colors antialiased";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  const classes = [baseStyles, variantStyles[variant], className]
    .filter(Boolean)
    .join(" ");
  return <span data-slot="badge" className={classes} {...props} />;
}
