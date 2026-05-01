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
          void: "#04060F",
          base: "#080C1A",
          surface: "#0E1220",
          elevated: "#151B2E",
          overlay: "#1C2438",
        },
        border: {
          ghost: "rgba(255,255,255,0.03)",
          subtle: "rgba(255,255,255,0.07)",
          default: "rgba(255,255,255,0.11)",
          hover: "rgba(255,255,255,0.18)",
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
          primary: "#F0F4FF",
          secondary: "#8B9CC8",
          muted: "#4A5475",
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
