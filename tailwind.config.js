/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: "rgb(24,62,105)",
          orange: "rgb(236,107,44)",
        },
        text: {
          primary: "rgb(24,62,105)",
          body: "rgb(75, 85, 99)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-in-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
