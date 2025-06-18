// tailwind.config.js (This is the content you provided, with the plugins array corrected)
/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "apple-green": {
          DEFAULT: "#5dfc70",
          dark: "#3ddc50",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        mono: ["AppleII", "monospace"],
        cody: ['var(--font-cody)', 'sans-serif'],
      },
      keyframes: {
        borderTrail: {
          '0%': { borderColor: '#ff5733' }, // Red
          '25%': { borderColor: '#ffc300' }, // Yellow
          '50%': { borderColor: '#33ff57' }, // Green
          '75%': { borderColor: '#3380ff' }, // Blue
          '100%': { borderColor: '#ff5733' }, // Back to Red
        },
      },
      animation: {
        borderTrail: 'borderTrail 2s linear infinite',
      },
    },
  },
  plugins: [
    // "@tailwindcss/postcss", // REMOVE THIS LINE
    '@tailwindcss/typography',
    // If you were using "tailwindcss-animate", add it back here if needed:
     "tailwindcss-animate",
  ],
};

export default config;