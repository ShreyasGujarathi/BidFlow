import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3BA7FF",
          foreground: "#031128",
        },
        secondary: {
          DEFAULT: "#F6C350",
          foreground: "#1F1200",
        },
        muted: {
          DEFAULT: "#1C2544",
          foreground: "#9BAAD0",
        },
        accent: {
          DEFAULT: "#182340",
          foreground: "#F3F6FF",
        },
        background: "#050B1B",
        surface: "#0B152F",
        border: "#1B2846",
      },
      boxShadow: {
        glow: "0 25px 65px rgba(59, 167, 255, 0.3)",
        soft: "0 20px 55px rgba(15, 23, 42, 0.08)",
        strong: "0 35px 75px rgba(8, 12, 31, 0.15)",
      },
      borderRadius: {
        xl: "1.2rem",
        "2xl": "1.6rem",
        "3xl": "2.4rem",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;

