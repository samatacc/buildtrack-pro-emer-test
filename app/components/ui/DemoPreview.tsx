"use client";

import { ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Card } from "./Card";
import Placeholder from "./Placeholder";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  position?: "top" | "right" | "bottom" | "left";
}

interface DemoPreviewProps extends ComponentProps<"div"> {
  imageUrl: string;
  hotspots: Hotspot[];
  className?: string;
}

export function DemoPreview({
  imageUrl,
  hotspots,
  className = "",
  ...props
}: DemoPreviewProps) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  return (
    <div className={twMerge("relative w-full", className)} {...props}>
      {imageUrl ? (
        <div
          className="w-full aspect-video bg-cover bg-center rounded-lg shadow-md"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          {/* Hotspots */}
          {hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              className={twMerge(
                "absolute w-6 h-6 rounded-full bg-[rgb(236,107,44)] border-2 border-white",
                "transform -translate-x-1/2 -translate-y-1/2",
                "hover:scale-110 transition-transform duration-300",
                "focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:ring-offset-2",
                activeHotspot === hotspot.id && "scale-110",
              )}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
              }}
              onClick={() =>
                setActiveHotspot(
                  activeHotspot === hotspot.id ? null : hotspot.id,
                )
              }
            >
              <span className="sr-only">View {hotspot.title}</span>
            </button>
          ))}
        </div>
      ) : (
        <Placeholder
          height="450px"
          text="Interactive Dashboard Preview"
          color="blue"
          className="rounded-lg shadow-md mb-8"
        />
      )}

      {/* Active Hotspot Info */}
      {activeHotspot && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-10 animate-fade-in-up">
          {hotspots
            .filter((hotspot) => hotspot.id === activeHotspot)
            .map((hotspot) => (
              <div key={hotspot.id} className="p-4">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setActiveHotspot(null)}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="font-medium text-lg mb-2 text-[rgb(24,62,105)]">
                  {hotspot.title}
                </div>
                <div className="text-sm text-gray-600">
                  {hotspot.description}
                </div>
              </div>
            ))}
        </Card>
      )}
    </div>
  );
}
