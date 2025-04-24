import type { Config } from "tailwindcss";
import { colors } from "./app/styles/colors";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors,
      backgroundColor: {
        primary: colors.primary,
        secondary: colors.secondary,
        slate: colors.slate,
      },
      textColor: {
        primary: colors.primary,
        secondary: colors.secondary,
        slate: colors.slate,
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",
      },
      borderColor: {
        primary: colors.primary,
        secondary: colors.secondary,
        slate: colors.slate,
      },
      ringColor: {
        primary: colors.primary,
        secondary: colors.secondary,
        slate: colors.slate,
      },
    },
  },
  plugins: [],
};

export default config;
