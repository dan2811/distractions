import { z } from "zod";

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
  }),
  getOne: protectedProcedure.input(z.object({
    id: z.string(),
  })).query(({ input }) => {
    return prisma.event.findUnique({
      select: {
        name: true,
        ownerId: true,
        owner: true,
        musicians: true,
        date: true,
        packages: true,
        eventTypeId: true,
        EventType: true,
        Equipment: true,
        location: true,
        price: true,
      },
      where: {
        id: input.id,
      }
    });
  }),
  updateEvent: protectedProcedure.input(z.object({
    eventId: z.string(),
    name: z.string(),
    date: z.string(),
    location: z.string().optional(),
  })).mutation(({ input }) => {
    const { eventId, ...data } = input;
    return prisma.event.update({
      where: {
        id: eventId
      },
      data
    });
  }),
});
