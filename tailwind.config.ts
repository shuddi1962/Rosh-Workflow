import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          void: "#F8FAFC",
          base: "#FFFFFF",
          surface: "#F1F5F9",
          elevated: "#E2E8F0",
          overlay: "#CBD5E1",
        },
        border: {
          ghost: "rgba(0,0,0,0.05)",
          subtle: "rgba(0,0,0,0.10)",
          default: "rgba(0,0,0,0.15)",
          hover: "rgba(0,0,0,0.25)",
        },
        accent: {
          primary: "#1A56DB",
          "primary-glow": "#3B82F6",
          gold: "#F59E0B",
          "gold-light": "#FCD34D",
          emerald: "#10B981",
          red: "#EF4444",
          orange: "#F97316",
          purple: "#8B5CF6",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
          "on-accent": "#FFFFFF",
        },
        status: {
          live: "#10B981",
          scheduled: "#3B82F6",
          draft: "#F59E0B",
          failed: "#EF4444",
          published: "#10B981",
        },
      },
      fontFamily: {
        clash: ["Clash Display", "sans-serif"],
        cabinet: ["Cabinet Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}

export default config
