import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

interface Logo {
  name: string;
  src?: string;
  width?: number;
  height?: number;
}

interface LogoStripProps extends ComponentProps<"div"> {
  logos: Logo[];
  scrolling?: boolean;
  className?: string;
}

export function LogoStrip({
  logos,
  scrolling = true,
  className = "",
  ...props
}: LogoStripProps) {
  // Double the logos for infinite scroll effect
  const displayLogos = scrolling ? [...logos, ...logos] : logos;

  return (
    <div
      className={twMerge("w-full overflow-hidden bg-white py-8", className)}
      {...props}
    >
      <div
        className={twMerge(
          "flex items-center gap-12",
          scrolling && "animate-[scroll_30s_linear_infinite]",
        )}
      >
        {displayLogos.map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300"
          >
            {logo.src ? (
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width || 120}
                height={logo.height || 40}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="h-12 px-6 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                <span className="font-medium text-[rgb(24,62,105)]">
                  {logo.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
