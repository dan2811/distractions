import { eventRouter } from "~/server/api/routers/bookings";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  events: eventRouter,
  users: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
