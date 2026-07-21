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
          dark: "#0D0A12",        // Rich Obsidian-Burgundy/Purple Background (Exact Photo Match)
          card: "#16131F",        // Deep Luxury Burgundy-Obsidian Card (#16131F)
          cardHover: "#201A2C",   // Illuminated Card Hover State (#201A2C)
          border: "#2A2338",      // Crisp Subtle Card Border (#2A2338)
          borderHover: "#483C5E", // Highlighted Border
          accent: "#EF4444",      // Commanding Tesla Red Accent (#EF4444 / #FF3B30)
          accentHover: "#DC2626", // Deep Tesla Red
          blue: "#3E6AE1",        // Tesla Electric Blue
          blueHover: "#2C52C8",   // Deep Electric Blue
          emerald: "#10B981",     // Clean Positive Gain / Live Toast (#10B981)
          rose: "#EF4444",        // Clean Negative / Red Button
          amber: "#F59E0B"        // Warm Gold / Yellow Logo & Bolt (#F59E0B)
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      boxShadow: {
        'tesla': '0 12px 35px -10px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        'tesla-hover': '0 20px 45px -12px rgba(239, 68, 68, 0.3), 0 0 1px 1px rgba(255, 255, 255, 0.2)',
        'red-glow': '0 0 30px -5px rgba(239, 68, 68, 0.55)',
        'amber-glow': '0 0 25px -5px rgba(245, 158, 11, 0.45)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.45)'
      }
    },
  },
  plugins: [],
};
export default config;
