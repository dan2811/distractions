import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export const globalColors = {
  main: {
    menu: "black",
    dark: "#1A1A1A",
    light: "#aaa",
    input: "#2A2A2A",
    accent: "#a8a07c",
    error: "#ff0000",
  },
  jobStatus: {
    // MUST BE HEX CODES
    accepted: "#E8FFE9",
    pending: "#FFFDE8",
    rejected: "#FFE8E8",
    other: "#E8F5FF"
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

