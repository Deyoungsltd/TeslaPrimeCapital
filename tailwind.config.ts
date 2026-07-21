import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          gold: "#D4AF37",
          goldHover: "#C59B27",
          blue: "#2563EB",
          blueHover: "#1D4ED8",
          emerald: "#10B981",
          rose: "#F43F5E"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
