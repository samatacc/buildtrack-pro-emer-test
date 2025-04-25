"use client";

import { ComponentProps, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface Metric {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

interface MetricsDisplayProps extends ComponentProps<"div"> {
  metrics: Metric[];
  className?: string;
}

export function MetricsDisplay({
  metrics,
  className = "",
  ...props
}: MetricsDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={twMerge(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",
        className,
      )}
      {...props}
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={twMerge(
            "text-center opacity-0",
            isVisible && "animate-fade-in-up",
          )}
          style={{
            animationDelay: `${index * 200}ms`,
            animationFillMode: "forwards",
          }}
        >
          <div className="text-4xl font-bold text-[rgb(24,62,105)] mb-2">
            {metric.prefix}
            {isVisible ? <CountUp end={metric.value} duration={2000} /> : "0"}
            {metric.suffix}
          </div>
          <div className="text-gray-600">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}

function CountUp({ end, duration }: { end: number; duration: number }) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameId = useRef<number>();

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;

      const progress = timestamp - startTime.current;
      const percentage = Math.min(progress / duration, 1);

      setCount(Math.floor(end * percentage));

      if (percentage < 1) {
        frameId.current = requestAnimationFrame(animate);
      }
    };

    frameId.current = requestAnimationFrame(animate);

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
}
