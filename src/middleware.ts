import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            // Check if the middleware is processing the
            // route which requires a specific role
            const path = req.nextUrl.pathname;
            console.debug("User visiting path: ", path);
            if (path.startsWith("/admin")) {
                if (token?.role === "admin" || token?.role === "superAdmin") {
                    console.log("ADMIN ACCESS GRANTED TO: ", JSON.stringify(token));
                    return true;
                }
                console.log("ADMIN ACCESS DENIED TO: ", JSON.stringify(token));
                return false;
            }

            // By default return true only if the token is not null
            // (this forces the users to be signed in to access the page)
            return token !== null;
        }
    }
});

// Define paths for which the middleware will run
export const config = {
    matcher: [
        "/event/:path*",
        "/profile/:path*",
        "/admin/:path*"
    ]
};