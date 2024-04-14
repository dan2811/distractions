import { eventRouter } from "~/server/api/routers/events";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/users";
import { paypalRouter } from "./routers/paypal/paypal";
import { jobRouter } from "./routers/jobs";
import { contractRouter } from "./routers/contracts";
import { generalDocumentRouter } from "./routers/generalDocuments";
import { instrumentRouter } from "./routers/instruments";
import { statsRouter } from "./routers/stats";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  events: eventRouter,
  users: userRouter,
  instruments: instrumentRouter,
  paypal: paypalRouter,
  jobs: jobRouter,
  contracts: contractRouter,
  generalDocuments: generalDocumentRouter,
  stats: statsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
