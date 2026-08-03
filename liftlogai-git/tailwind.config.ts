import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0b0b0b",
        },
        card: {
          DEFAULT: "#ffffff",
          dark: "#111111",
        },
        border: {
          DEFAULT: "#e4e4e7",
          dark: "#27272a",
        },
      },
      borderRadius: {
        card: "0.75rem",
        button: "0.5rem",
        input: "0.5rem",
        badge: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        "card-dark": "0 1px 2px 0 rgb(0 0 0 / 0.3)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;