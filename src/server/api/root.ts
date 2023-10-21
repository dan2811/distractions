import { eventRouter } from "~/server/api/routers/events";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/users";
import { paypalRouter } from "./routers/paypal/paypal";
import { jobRouter } from "./routers/jobs";
import { contractRouter } from "./routers/contracts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  events: eventRouter,
  users: userRouter,
  paypal: paypalRouter,
  jobs: jobRouter,
  contracts: contractRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
