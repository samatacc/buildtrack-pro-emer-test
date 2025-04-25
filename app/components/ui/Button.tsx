import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[rgb(236,107,44)] text-white hover:bg-[rgb(24,62,105)]",
  secondary:
    "border-2 border-[rgb(24,62,105)] text-[rgb(24,62,105)] hover:bg-[rgb(24,62,105)] hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-8 py-3",
  lg: "px-10 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  isFullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        "inline-block rounded-lg transition-colors font-medium animate-fade-in",
        variantStyles[variant],
        sizeStyles[size],
        isFullWidth ? "w-full" : "",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
