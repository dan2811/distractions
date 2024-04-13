import { addDays } from "date-fns";
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
            date_gte: z.date().optional(),
            date_lte: z.date().optional(),
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
              lte: input?.filter?.date_lte,
            },
          },
        },
        orderBy: {
          event: {
            date: "desc",
          },
        },
      });
    }),
  getMyNextJobs: protectedProcedure
    .input(
      z
        .object({
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
          OR: [
            {
              status: {
                contains: "accepted",
              },
            },
            {
              status: {
                contains: "pending",
              },
            },
          ],
          event: {
            date: {
              gte: new Date(),
            },
          },
        },
        take: 1,
        orderBy: {
          event: {
            date: "asc",
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
