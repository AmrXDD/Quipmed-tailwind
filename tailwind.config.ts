import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette remapped to the QuipMed brand: Green + White + Black.
        // Legacy token names (navy/cyan) are preserved so existing classes
        // keep working — they now refer to black/green shades.
        navy: {
          DEFAULT: "var(--bg-primary)",
          900: "var(--bg-primary)",
          800: "var(--bg-secondary)",
          700: "var(--bg-tertiary)",
          600: "var(--bg-tertiary)",
          500: "var(--bg-tertiary)",
        },
        // Brand: Black · Dark Green · White.
        // `cyan.*` kept as aliases so existing classes keep working —
        // both `mint` and `cyan` point at the same dark-green scale.
        cyan: {
          neon: "#14532D",  // Primary dark green
          soft: "#4B9668",  // Medium green for hover / small highlights on black
          deep: "#0A2E17",  // Deepest green for subtle backgrounds / borders
        },
        mint: {
          DEFAULT: "#14532D",
          soft: "#4B9668",
          deep: "#0A2E17",
        },
        slate: {
          mid: "var(--text-muted)",
          light: "var(--text-secondary)",
        },
        // Custom text color that swaps between white/black
        primary: "var(--text-primary)",
      },
      fontFamily: {
        sans: [
          "Outfit",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(20,83,45,0.45), 0 10px 40px -8px rgba(20,83,45,0.55)",
        console:
          "0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
        card: "0 20px 50px -20px rgba(0,0,0,0.45)",
        pill: "0 20px 60px -20px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.04) inset",
      },
      backgroundImage: {
        "grid-dots":
          "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.14) 1px, transparent 0)",
        "grid-dots-dark":
          "radial-gradient(circle at 1px 1px, rgba(75,150,104,0.2) 1px, transparent 0)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        scan: {
          "0%,100%": { transform: "translateY(-22px)" },
          "50%": { transform: "translateY(22px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        scan: "scan 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
