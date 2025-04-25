import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type TextSize = "sm" | "base" | "lg" | "xl";
type TextAlign = "left" | "center" | "right";

interface TextProps extends ComponentProps<"p"> {
  size?: TextSize;
  align?: TextAlign;
  withAnimation?: boolean;
  animationDelay?: number;
  className?: string;
}

const textSizes: Record<TextSize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const alignments: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Text({
  size = "base",
  align = "left",
  withAnimation = true,
  animationDelay = 0,
  className = "",
  style,
  children,
  ...props
}: TextProps) {
  return (
    <p
      className={twMerge(
        "text-gray-700",
        textSizes[size],
        alignments[align],
        withAnimation ? "animate-fade-in" : "",
        className,
      )}
      style={{
        ...style,
        animationDelay: withAnimation ? `${animationDelay}ms` : undefined,
      }}
      {...props}
    >
      {children}
    </p>
  );
}
