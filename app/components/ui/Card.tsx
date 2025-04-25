import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps extends ComponentProps<"div"> {
  variant?: "solid" | "glass";
  withHover?: boolean;
  withAnimation?: boolean;
  animationDelay?: number;
  className?: string;
}

export function Card({
  variant = "solid",
  withHover = true,
  withAnimation = true,
  animationDelay = 0,
  className = "",
  style,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        "rounded-lg p-6",
        variant === "solid"
          ? "bg-white shadow-md"
          : "bg-white/80 backdrop-blur-md",
        withHover
          ? "transition-transform hover:-translate-y-1 hover:shadow-lg"
          : "",
        withAnimation ? "animate-fade-in-up" : "",
        className,
      )}
      style={{
        ...style,
        animationDelay: withAnimation ? `${animationDelay}ms` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
