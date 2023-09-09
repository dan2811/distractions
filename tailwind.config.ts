import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        main: {
          dark: "#1A1A1A",
          accent: "#a8a07c",
        }
      },
      fontFamily: {
        headers: ['var(--font-exo)', ...fontFamily.sans],
        body: ['var(--font-noto)', ...fontFamily.sans],
      }
    },
  },
  plugins: [],
} satisfies Config;
