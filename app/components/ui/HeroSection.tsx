import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { Section } from "./Section";
import { Heading } from "./Heading";
import { Text } from "./Text";

interface HeroSectionProps extends ComponentProps<"section"> {
  title: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
  backgroundImage?: string;
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
}

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  primaryCta,
  secondaryCta,
  className = "",
  contentClassName = "",
  children,
  ...props
}: HeroSectionProps) {
  return (
    <Section
      className={twMerge(
        "bg-white relative min-h-[600px] flex items-center justify-center",
        className,
      )}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
      {...props}
    >
      <div
        className={twMerge(
          "text-center relative z-10 px-4 py-12 max-w-4xl mx-auto",
          contentClassName,
        )}
      >
        <Heading level="h1" align="center" className="animate-fade-in">
          {title}
        </Heading>

        {subtitle && (
          <Text
            size="xl"
            align="center"
            className="max-w-3xl mx-auto mb-12 text-[rgb(24,62,105)] animate-fade-in animation-delay-200"
          >
            {subtitle}
          </Text>
        )}

        {children}

        {(primaryCta || secondaryCta) && (
          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in animation-delay-600">
            {primaryCta && (
              <a
                href={primaryCta.href}
                className="px-8 py-3 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-[rgb(24,62,105)] transition-colors font-medium"
              >
                {primaryCta.text}
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="px-8 py-3 text-[rgb(24,62,105)] border-2 border-[rgb(24,62,105)] rounded-lg hover:bg-[rgb(24,62,105)] hover:text-white transition-colors font-medium"
              >
                {secondaryCta.text}
              </a>
            )}
          </div>
        )}
      </div>

      {backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>
      )}
    </Section>
  );
}
