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
          dark: "#080A0F",        // Deep Obsidian Navy Background (Exact Screenshot Match)
          card: "#111520",        // Sleek Dark Midnight Blue Card (#111520)
          cardHover: "#161B29",   // Highlighted Card Hover State
          border: "#1E2433",      // Crisp Subtle Card Border (#1E2433)
          borderHover: "#2C354C", // Highlighted Border
          accent: "#EF4444",      // Commanding Tesla Red Accent (Exact Button Match #EF4444)
          accentHover: "#DC2626", // Deep Tesla Red
          blue: "#3E6AE1",        // Tesla Electric Blue
          blueHover: "#2C52C8",   // Deep Electric Blue
          emerald: "#10B981",     // Clean Positive Gain / Live Toast (#10B981)
          rose: "#EF4444",        // Clean Negative / Red Button
          amber: "#F59E0B"        // Clean Pending Review
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      boxShadow: {
        'tesla': '0 12px 35px -10px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.06)',
        'tesla-hover': '0 20px 45px -12px rgba(239, 68, 68, 0.25), 0 0 1px 1px rgba(255, 255, 255, 0.15)',
        'red-glow': '0 0 25px -5px rgba(239, 68, 68, 0.45)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.4)'
      }
    },
  },
  plugins: [],
};
export default config;
