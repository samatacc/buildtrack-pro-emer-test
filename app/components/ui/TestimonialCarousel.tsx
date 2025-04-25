"use client";

import { ComponentProps, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { Card } from "./Card";
import { Text } from "./Text";
import Image from "next/image";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
}

interface TestimonialCarouselProps extends ComponentProps<"div"> {
  testimonials: Testimonial[];
  autoRotate?: boolean;
  rotationInterval?: number;
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoRotate = true,
  rotationInterval = 5000,
  className = "",
  ...props
}: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval, testimonials.length]);

  return (
    <div className={twMerge("w-full relative", className)} {...props}>
      {/* Testimonial Cards */}
      <div className="relative h-[300px] overflow-hidden">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            variant="glass"
            className={twMerge(
              "absolute w-full transition-all duration-500 ease-in-out",
              index === activeIndex
                ? "opacity-100 translate-x-0"
                : index < activeIndex
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full",
            )}
          >
            <div className="flex flex-col items-center text-center p-6">
              <div className="mb-4">
                {testimonial.avatarUrl ? (
                  <Image
                    src={testimonial.avatarUrl}
                    alt={testimonial.author}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[rgb(24,62,105)] text-white flex items-center justify-center font-bold text-xl">
                    {testimonial.author
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </div>
                )}
              </div>

              <Text size="xl" className="italic mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </Text>

              <Text size="base" className="font-medium text-[rgb(24,62,105)]">
                {testimonial.author}
              </Text>

              <Text size="sm" className="text-gray-600">
                {testimonial.role} at {testimonial.company}
              </Text>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={twMerge(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === activeIndex
                ? "bg-[rgb(24,62,105)]"
                : "bg-gray-300 hover:bg-gray-400",
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() =>
          setActiveIndex(
            (current) =>
              (current - 1 + testimonials.length) % testimonials.length,
          )
        }
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 text-gray-600 hover:text-[rgb(24,62,105)] transition-colors"
        aria-label="Previous testimonial"
      >
        ←
      </button>

      <button
        onClick={() =>
          setActiveIndex((current) => (current + 1) % testimonials.length)
        }
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 text-gray-600 hover:text-[rgb(24,62,105)] transition-colors"
        aria-label="Next testimonial"
      >
        →
      </button>
    </div>
  );
}
