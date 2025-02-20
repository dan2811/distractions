import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultUser,
} from "next-auth";
import { type JWT } from "next-auth/jwt";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { globalColors } from "tailwind.config";
import { prisma } from "~/server/db";
import { type Role } from "~/types";
import { sendVerificationRequest } from "./authEmails";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

// common interface for JWT and Session
interface User extends DefaultUser {
  role: Role;
  phone: string;
}
declare module "next-auth" {
  interface Session {
    user: User;
  }
}
declare module "next-auth/jwt" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface JWT extends User {}
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn(params) {
      const user = await prisma.user.findUnique({
        where: {
          email: params.profile?.email ?? params.user.email ?? undefined,
        },
      });

      if (!user) {
        throw new Error("User does not exist");
      }
      return true;
    },
    jwt({ token, user }: { token: JWT; user: DefaultUser | undefined }) {
      if (user) {
        // add extra key/value(s) to the token
        token.sub = user.id;
        token.phone = (user as User).phone;
        token.role = (user as User).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.phone = token.phone;
        session.user.id = token.sub;
        const user = await prisma.user.findUnique({
          where: {
            id: token.sub,
          },
        });
        //Assign role to session for use in front end
        session.user.role = user?.role ?? "client";
        //Assign role to token for use in middleware to check for admin access
        token.role = user?.role ?? "client";
      }
      return session;
    },
  },
  theme: {
    colorScheme: "dark", // "auto" | "dark" | "light"
    brandColor: globalColors.main.accent, // Must be a hex color code
    logo: "/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo_dark.e8bdd739.png&w=384&q=75", // Absolute URL to image
    buttonText: globalColors.main.dark, // must be a hex color code
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile: (profile: GoogleProfile) => {
        return {
          id: profile.sub,
          given_name: profile.given_name,
          family_name: profile.family_name,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "client",
        };
      },
      allowDangerousEmailAccountLinking: true,
    }),
    Email({
      async sendVerificationRequest(params) {
        return await sendVerificationRequest(params);
      },
      type: "email",
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
