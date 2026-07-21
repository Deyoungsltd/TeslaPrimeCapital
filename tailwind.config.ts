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
          dark: "#050507",        // Ultra-Deep Obsidian Black
          card: "#111116",        // Sleek High-Tech Glass Panel
          cardHover: "#18181f",   // Illuminated Hover Panel
          border: "#262630",      // Fine 1px Crisp Metallic Border
          borderHover: "#444456", // Highlighted Electric Border
          accent: "#FFFFFF",      // Pure Crisp White
          blue: "#3E6AE1",        // Tesla Electric Blue Accent
          blueHover: "#2C52C8",   // Deep Electric Blue
          emerald: "#10B981",     // Clean Positive Gain / Deposit
          emeraldHover: "#059669",// Deep Emerald
          rose: "#F43F5E",        // Clean Negative Debit / Rejection
          amber: "#F59E0B",       // Clean Pending Review
          gold: "#D4AF37"         // Luxury Institutional Highlight
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      boxShadow: {
        'tesla': '0 12px 40px -10px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        'tesla-hover': '0 20px 50px -12px rgba(62, 106, 225, 0.25), 0 0 1px 1px rgba(255, 255, 255, 0.2)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'blue-glow': '0 0 30px -5px rgba(62, 106, 225, 0.5)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-panel': 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'electric-grid': 'linear-gradient(to right, #1f1f2e 1px, transparent 1px), linear-gradient(to bottom, #1f1f2e 1px, transparent 1px)'
      }
    },
  },
  plugins: [],
};
export default config;
