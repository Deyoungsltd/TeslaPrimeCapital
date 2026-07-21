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
          dark: "#0B0E14",        // Rich Deep Royal Navy/Charcoal (#0B0E14) — NOT pure black
          card: "#131824",        // Vibrant Midnight Blue Panel (#131824)
          cardHover: "#1B2233",   // Illuminated Card Hover State (#1B2233)
          border: "#20283E",      // Crisp High-Contrast Border (#20283E)
          borderHover: "#3B476B", // Highlighted Border
          accent: "#EF4444",      // Commanding Tesla Red Accent (#EF4444)
          accentHover: "#DC2626", // Deep Tesla Red
          blue: "#2563EB",        // Tesla Electric Blue (#2563EB)
          blueHover: "#1D4ED8",   // Deep Electric Blue
          emerald: "#10B981",     // Clean Positive Gain / Live Toast (#10B981)
          rose: "#EF4444",        // Clean Negative / Red Button
          amber: "#F59E0B",       // Clean Pending Review
          light: "#F8FAFC",       // High-Contrast Crisp Light/White section background
          slate: "#1E293B"        // Rich Slate Box
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      boxShadow: {
        'tesla': '0 12px 35px -10px rgba(0, 0, 0, 0.75), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
        'tesla-hover': '0 20px 45px -12px rgba(37, 99, 235, 0.35), 0 0 1px 1px rgba(255, 255, 255, 0.25)',
        'red-glow': '0 0 25px -5px rgba(239, 68, 68, 0.5)',
        'blue-glow': '0 0 25px -5px rgba(37, 99, 235, 0.5)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.45)'
      }
    },
  },
  plugins: [],
};
export default config;
