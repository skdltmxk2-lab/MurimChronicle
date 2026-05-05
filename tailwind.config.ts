import type { Config } from "tailwindcss";

const config: Config = {
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
          500: "#246bfe",
          600: "#1857db",
          700: "#1646ad"
        },
        mint: {
          50: "#eefbf5",
          600: "#0b8a61"
        },
        coral: {
          50: "#fff1ee",
          600: "#d54a31"
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
