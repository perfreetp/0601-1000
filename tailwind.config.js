/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        space: {
          950: "#050B18",
          900: "#0A1628",
          800: "#0F1F38",
          700: "#172A4A",
          600: "#1F3860",
          500: "#2A4A7A",
        },
        aurora: {
          50: "#E6FFFA",
          100: "#B3FEE8",
          200: "#73FCD4",
          300: "#36F5BC",
          400: "#00E5A8",
          500: "#00C48C",
          600: "#00A072",
        },
        metal: {
          100: "#E8EEF4",
          200: "#C4D4E0",
          300: "#9AB0C4",
          400: "#6B85A0",
          500: "#4A6380",
        },
        coral: {
          400: "#FF8A8A",
          500: "#FF6B6B",
          600: "#EE4F4F",
        },
        amber: {
          400: "#FFE369",
          500: "#FFD93D",
        },
      },
      fontFamily: {
        display: ["Orbitron", "system-ui", "sans-serif"],
        sans: ["'Noto Sans SC'", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "scan-line": "scanLine 4s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #00E5A8, 0 0 10px #00E5A8" },
          "100%": { boxShadow: "0 0 20px #00E5A8, 0 0 30px #00E5A8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
