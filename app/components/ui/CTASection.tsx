import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { Section } from "./Section";

interface CTASectionProps extends ComponentProps<"section"> {
  children: React.ReactNode;
  className?: string;
}

export function CTASection({
  children,
  className = "",
  ...props
}: CTASectionProps) {
  return (
    <Section
      className={twMerge("py-16 px-4 text-center bg-white", className)}
      {...props}
    >
      {children}
    </Section>
  );
}
