"use client";

import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Card } from "./Card";
import { Text } from "./Text";
import { Heading } from "./Heading";

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  className?: string;
  onSubmit?: (email: string) => Promise<void>;
}

export function NewsletterSignup({
  title = "Stay Updated",
  description = "Get the latest construction management insights and BuildTrack Pro updates.",
  className = "",
  onSubmit,
  ...props
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setStatus("loading");
      await onSubmit?.(email);
      setStatus("success");
      setEmail("");
      setError("");
    } catch (err) {
      setStatus("error");
      setError("Failed to subscribe. Please try again.");
    }
  };

  return (
    <Card className={twMerge("max-w-lg mx-auto", className)} {...props}>
      <div className="text-center mb-6">
        <Heading level="h3" className="mb-2">
          {title}
        </Heading>
        <Text size="base" className="text-gray-600">
          {description}
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className={twMerge(
              "w-full px-4 py-3 border border-gray-300 rounded-lg",
              "focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-transparent",
              "placeholder-gray-400",
              error && "border-red-500",
            )}
            disabled={status === "loading" || status === "success"}
          />
          {error && (
            <Text size="sm" className="text-red-500 mt-1">
              {error}
            </Text>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" id="consent" className="mt-1" required />
          <label htmlFor="consent" className="text-sm text-gray-600">
            I agree to receive marketing communications from BuildTrack Pro. You
            can unsubscribe at any time.
          </label>
        </div>

        <button
          type="submit"
          className={twMerge(
            "w-full px-6 py-3 rounded-lg font-medium transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:ring-offset-2",
            status === "loading"
              ? "bg-gray-400 cursor-not-allowed"
              : status === "success"
                ? "bg-green-500 text-white"
                : "bg-[rgb(236,107,44)] text-white hover:bg-[rgb(24,62,105)]",
          )}
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading"
            ? "Subscribing..."
            : status === "success"
              ? "✓ Subscribed!"
              : "Subscribe Now"}
        </button>
      </form>
    </Card>
  );
}
