/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0A0F1E",
          800: "#111827",
          700: "#1A2332",
          600: "#1F2B3D",
          500: "#2D3A4F",
        },
        electric: {
          500: "#3B82F6",
          400: "#60A5FA",
          300: "#93BBFD",
        },
        gold: {
          500: "#F59E0B",
          400: "#FBBF24",
          300: "#FCD34D",
        },
        surface: {
          DEFAULT: "#111827",
          light: "#1A2332",
          card: "#1F2B3D",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FCA5A5",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#6EE7B7",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
        },
        muted: {
          DEFAULT: "#6B7280",
          light: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [],
};
