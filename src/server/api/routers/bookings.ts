// import { z } from "zod";

import {
  createTRPCRouter, protectedProcedure,
  // protectedProcedure,
  // publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const eventRouter = createTRPCRouter({
  getMyBookings: protectedProcedure.query(({ ctx }) => {
    return prisma.event.findMany({
      where: {
        ownerId: ctx.session.user.id,
      }
    });
  })
});
