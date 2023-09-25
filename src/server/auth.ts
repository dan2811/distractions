import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultUser,
} from "next-auth";
import { type JWT } from "next-auth/jwt";
import Email from "next-auth/providers/email";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import { prisma } from "~/server/db";
import { type Role } from "~/types";

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
  interface JWT extends User { }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt({ token, user }: { token: JWT; user: DefaultUser | undefined; }) {
      if (user) {
        // Assign role to token for use in middleware to check for admin access
        token.sub = user.id;
        // Some nasty casting to keep TS happy when trying to get phone number and role into the token
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
            id: token.sub
          }
        });
        //Assign role to session for use in front end
        session.user.role = user?.role ?? "client";
        //Assign role to token for use in middleware to check for admin access
        token.role = user?.role ?? "client";
      }
      return session;
    }
  },
  theme: {
    brandColor: "#9760f2",
    buttonText: "Sign in with Google",
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
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "client"
        };
      },
      allowDangerousEmailAccountLinking: true
    }),
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT!),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
    })
    /**
     * ...add more providers here.
     *
     * @see https://next-auth.js.org/providers/github
     */
  ]
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
