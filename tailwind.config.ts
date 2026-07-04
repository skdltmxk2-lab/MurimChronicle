import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#191f28",
        line: "#e5e8eb",
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3182f6",
          600: "#1b64da",
          700: "#1950b7",
          800: "#173f91"
        },
        mint: {
          50: "#eefbf5",
          100: "#d9f7e9",
          200: "#bbeed6",
          300: "#83ddb8",
          400: "#43c392",
          500: "#10a376",
          600: "#0b8a61",
          700: "#076a4a",
          800: "#07563d"
        },
        coral: {
          50: "#fff1ee",
          100: "#ffe0da",
          200: "#ffc5ba",
          300: "#ff9b8b",
          400: "#f36d59",
          500: "#e2553f",
          600: "#d54a31",
          700: "#aa321f"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(25, 31, 40, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
