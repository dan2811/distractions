import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export const globalColors = {
  main: {
    dark: "#1A1A1A",
    accent: "#a8a07c",
  }
};

export const globalFonts = {
  headers: ['var(--font-exo)', ...fontFamily.sans],
  body: ['var(--font-noto)', ...fontFamily.sans],
};

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: globalColors,
      fontFamily: globalFonts,
    },
  },
  plugins: [],
} satisfies Config;

