import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

interface Badge {
  name: string;
  src?: string;
  width?: number;
  height?: number;
  tooltip?: string;
}

interface TrustBadgesProps extends ComponentProps<"div"> {
  badges: Badge[];
  className?: string;
}

export function TrustBadges({
  badges,
  className = "",
  ...props
}: TrustBadgesProps) {
  return (
    <div
      className={twMerge(
        "flex flex-wrap items-center justify-center gap-6",
        className,
      )}
      {...props}
    >
      {badges.map((badge) => (
        <div key={badge.name} className="relative group" title={badge.tooltip}>
          <div className="flex items-center justify-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            {badge.src ? (
              <Image
                src={badge.src}
                alt={badge.name}
                width={badge.width || 80}
                height={badge.height || 80}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="h-12 w-36 px-3 flex items-center justify-center bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-[rgb(24,62,105)]">
                  {badge.name}
                </span>
              </div>
            )}
          </div>

          {badge.tooltip && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-800 text-white text-sm rounded px-2 py-1 whitespace-nowrap">
                {badge.tooltip}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
