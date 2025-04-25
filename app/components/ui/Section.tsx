import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface SectionProps extends ComponentProps<"section"> {
  containerWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl" | "full";
  withPadding?: boolean;
  className?: string;
}

const containerWidths = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "5xl": "max-w-5xl",
  full: "max-w-full",
};

export function Section({
  containerWidth = "5xl",
  withPadding = true,
  className = "",
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={twMerge("w-full", withPadding ? "px-6 py-20" : "", className)}
      {...props}
    >
      <div
        className={twMerge("mx-auto w-full", containerWidths[containerWidth])}
      >
        {children}
      </div>
    </section>
  );
}
