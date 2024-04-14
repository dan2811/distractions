import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import { withUt } from "uploadthing/tw";

export const globalColors = {
  main: {
    menu: "black",
    dark: "#black",
    light: "#aaa",
    input: "#1f1f1f",
    accent: "#a8a07c",
    error: "#ff0000",
    white: "#ffffff",
  },
  jobStatus: {
    // MUST BE HEX CODES
    accepted: "#E8FFE9",
    pending: "#FFFDE8",
    rejected: "#FFE8E8",
    other: "#E8F5FF",
  },
};

export const globalFonts = {
  headers: ["var(--font-exo)", ...fontFamily.sans],
  body: ["var(--font-noto)", ...fontFamily.sans],
};

const config = withUt({
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: globalColors,
      fontFamily: globalFonts,
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}) satisfies Config;

export default config;
