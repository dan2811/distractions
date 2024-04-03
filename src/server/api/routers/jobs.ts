import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const jobRouter = createTRPCRouter({
  getMyJobs: protectedProcedure
    .input(
      z
        .object({
          filter: z.object({
            status: z.string().optional(),
            date_gte: z.string().optional(),
          }),
          includeEvents: z.boolean().optional().default(false),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      const include: { Instruments: boolean; event?: object } = {
        Instruments: true,
      };
      if (input?.includeEvents) {
        include.event = {
          select: {
            id: true,
            date: true,
            name: true,
            location: true,
          },
        };
      }
      return prisma.job.findMany({
        include,
        where: {
          musicianId: ctx.session.user.id,
          status: input?.filter?.status,
          event: {
            date: {
              gte: input?.filter?.date_gte,
            },
          },
        },
      });
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(({ input }) => {
      return prisma.job.findFirstOrThrow({
        where: {
          eventId: input.eventId,
        },
        include: {
          Instruments: true,
        },
      });
    }),
  updateOne: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        status: z.string(),
      }),
    )
    .mutation(({ input }) => {
      return prisma.job.update({
        where: {
          id: input.jobId,
        },
        data: {
          status: input.status,
        },
      });
    }),
});
