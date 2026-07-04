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
        ink: "#172033",
        line: "#dfe5ef",
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#b9d7ff",
          300: "#8fbdff",
          400: "#5f95ff",
          500: "#246bfe",
          600: "#1857db",
          700: "#1646ad",
          800: "#123983"
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
        soft: "0 18px 50px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
