import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),
    // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    SENDGRID_API_KEY: z.string(),
    EMAIL_FROM: z.string().min(1),
    PAYPAL_URL: z.string().url(),
    PAYPAL_CLIENT_ID: z.string(),
    PAYPAL_CLIENT_SECRET: z.string(),
    PAYPAL_DEPOSIT_ACCOUNT_EMAIL: z.string(),
    MAIN_URL: z.string().url(),
    NUM_DAYS_BEFORE_EVENT_LOCK: z.string(),
    DAYS_BEFORE_EVENT_FINAL_BALANCE_DUE: z.string(),
    UPLOADTHING_SECRET: z.string(),
    UPLOADTHING_APP_ID: z.string(),
    PAYPAL_FINAL_BALANCE_CLIENT_ID: z.string(),
    PAYPAL_FINAL_BALANCE_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    PAYPAL_URL: process.env.PAYPAL_URL,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_DEPOSIT_ACCOUNT_EMAIL: process.env.PAYPAL_DEPOSIT_ACCOUNT_EMAIL,
    MAIN_URL: process.env.MAIN_URL,
    NUM_DAYS_BEFORE_EVENT_LOCK: process.env.NUM_DAYS_BEFORE_EVENT_LOCK,
    DAYS_BEFORE_EVENT_FINAL_BALANCE_DUE:
      process.env.DAYS_BEFORE_EVENT_FINAL_BALANCE_DUE,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    PAYPAL_FINAL_BALANCE_CLIENT_ID: process.env.PAYPAL_FINAL_BALANCE_CLIENT_ID,
    PAYPAL_FINAL_BALANCE_SECRET: process.env.PAYPAL_FINAL_BALANCE_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
