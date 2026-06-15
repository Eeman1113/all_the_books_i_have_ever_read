import * as React from "react";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-[#1a1714] text-white hover:bg-[#1a1714]/90",
  secondary: "bg-[#f1f1f1] text-black hover:bg-[#e8e8e8]",
  outline:
    "border border-[#e8e8e8] bg-transparent text-black hover:bg-[#f1f1f1]",
  ghost: "bg-transparent text-black hover:bg-[#f1f1f1]",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3",
  lg: "h-10 px-6",
  icon: "h-9 w-9",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-medium text-[15px] leading-[1.625] antialiased transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a3a3a3] disabled:pointer-events-none disabled:opacity-50";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "default", size = "default", className = "", ...props },
    ref,
  ) {
    const classes = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} data-slot="button" className={classes} {...props} />;
  },
);

export function ButtonSecondary({ children }: { children: React.ReactNode }) {
  return <Button variant="secondary">{children}</Button>;
}
