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
          void: "#F6F9FD",
          base: "#FFFFFF",
          surface: "#F1F5F9",
          elevated: "#E2E8F0",
          overlay: "#CBD5E1",
        },
        border: {
          ghost: "rgba(0,0,0,0.03)",
          subtle: "rgba(0,0,0,0.05)",
          default: "rgba(0,0,0,0.08)",
          hover: "rgba(0,0,0,0.12)",
        },
        accent: {
          primary: "#1468F5",
          "primary-glow": "#3B82F6",
          gold: "#F59E0B",
          "gold-light": "#FCD34D",
          emerald: "#10B981",
          red: "#EF233C",
          orange: "#F97316",
        },
        text: {
          primary: "#0A1833",
          secondary: "#475569",
          muted: "#94A3B8",
          "on-accent": "#FFFFFF",
        },
        status: {
          live: "#10B981",
          scheduled: "#3B82F6",
          draft: "#F59E0B",
          failed: "#EF233C",
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