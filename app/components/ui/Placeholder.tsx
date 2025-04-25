"use client";

import React from "react";

type PlaceholderProps = {
  width?: string;
  height?: string;
  text?: string;
  color?: "blue" | "orange" | "gray";
  className?: string;
};

export default function Placeholder({
  width = "100%",
  height = "300px",
  text = "Image Placeholder",
  color = "blue",
  className = "",
}: PlaceholderProps) {
  const getBackgroundColor = () => {
    switch (color) {
      case "blue":
        return "rgb(24,62,105)";
      case "orange":
        return "rgb(236,107,44)";
      case "gray":
        return "rgb(243,244,246)";
      default:
        return "rgb(24,62,105)";
    }
  };

  const getTextColor = () => {
    return color === "gray" ? "rgb(75,85,99)" : "white";
  };

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0.5rem",
        fontWeight: "500",
        fontSize: "1rem",
      }}
      className={className}
    >
      {text}
    </div>
  );
}
