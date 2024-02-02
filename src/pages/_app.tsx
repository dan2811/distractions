import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { globalColors } from "tailwind.config";
import { Analytics } from "@vercel/analytics/react";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const theme = createTheme({
    palette: {
      primary: {
        main: globalColors.main.accent,
        contrastText: globalColors.main.white,
      },
      secondary: {
        main: globalColors.main.input,
      },
      background: {
        default: globalColors.main.menu,
        paper: globalColors.main.menu,
      },
      text: {
        primary: globalColors.main.white,
        secondary: globalColors.main.white,
      },
    },
  });

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <Toaster position="bottom-center" reverseOrder={false} />
        <Analytics />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
