import { TRPCError } from "@trpc/server";
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
  getMyGigs: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.role !== "musician") throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be a musician to access this resource" });
    return prisma.event.findMany({
      select: {
        id: true,
        location: true,
        date: true,
      },
      where: {
        musicians: {
          every: {
            id: ctx.session.user.id,
          }
        }
      }
    });
  }),
  getOne: protectedProcedure.input(z.object({
    id: z.string(),
  })).query(({ input }) => {
    return prisma.event.findUnique({
      include: {
        packages: true,
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
  })
});
