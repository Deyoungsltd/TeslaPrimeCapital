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
          dark: "#000000",        // Pure Deep Jet Black (Tesla style)
          card: "#111113",        // Sleek Dark Panel
          cardHover: "#18181b",   // Subtle Hover Panel
          border: "#26262b",      // Fine 1px Sharp Border
          borderHover: "#3f3f46", // Highlighted Border
          accent: "#FFFFFF",      // Crisp White Accent
          accentHover: "#e5e5e5", // Soft White Hover
          blue: "#3E6AE1",        // Tesla Electric Blue
          blueHover: "#3458B8",   // Deep Electric Blue
          emerald: "#10B981",     // Clean Positive Gain / Deposit
          rose: "#F43F5E",        // Clean Negative Debit / Rejection
          amber: "#F59E0B"        // Clean Pending Review
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      boxShadow: {
        'tesla': '0 10px 30px -10px rgba(0,0,0,0.8)',
        'tesla-hover': '0 20px 40px -15px rgba(255,255,255,0.08)'
      }
    },
  },
  plugins: [],
};
export default config;
