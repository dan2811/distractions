import { type Config } from "tailwindcss";
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
    other: "#E8F5FF"
  }
};

export const globalFonts = {
  headers: ['var(--font-exo)', ...fontFamily.sans],
  body: ['var(--font-noto)', ...fontFamily.sans],
};

export default withUt({
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: globalColors,
      fontFamily: globalFonts,
    },
  },
  plugins: [],
}) satisfies Config;

