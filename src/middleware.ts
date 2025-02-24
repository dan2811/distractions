import { withAuth } from "next-auth/middleware";
import { log } from "next-axiom";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Check if the middleware is processing the
      // route which requires a specific role
      const path = req.nextUrl.pathname;
      log.debug("USER_VISITING_PATH", { user: token, requestedPath: path });

      if (path.startsWith("/admin")) {
        if (token?.role === "admin" || token?.role === "superAdmin") {
          log.info("ADMIN_ACCESS_GRANTED", { user: token });
          return true;
        }
        log.warn("ADMIN_ACCESS_DENIED", { user: token });
        return false;
      }

      // By default return true only if the token is not null
      // (this forces the users to be signed in to access the page)
      return token !== null;
    },
  },
});

// Define paths for which the middleware will run
export const config = {
  matcher: ["/event/:path*", "/profile/:path*", "/admin/:path*"],
};
