import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";
type HeadingAlign = "left" | "center" | "right";

interface HeadingProps extends Omit<ComponentProps<"h1">, "className"> {
  level?: HeadingLevel;
  align?: HeadingAlign;
  withAnimation?: boolean;
  animationDelay?: number;
  className?: string;
}

const headingSizes: Record<HeadingLevel, string> = {
  h1: "text-5xl font-bold mb-6",
  h2: "text-3xl font-bold mb-4",
  h3: "text-2xl font-bold mb-3",
  h4: "text-xl font-bold mb-2",
};

const alignments: Record<HeadingAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Heading({
  level = "h2",
  align = "left",
  withAnimation = true,
  animationDelay = 0,
  className = "",
  style,
  children,
  ...props
}: HeadingProps) {
  const Component = level;

  return (
    <Component
      className={twMerge(
        "text-[rgb(24,62,105)]",
        headingSizes[level],
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
    </Component>
  );
}
