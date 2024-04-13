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
  test: protectedProcedure.query(async ({ ctx }) => {
    const updated = await ctx.prisma.job.update({
      data: {
        id: "clsxmx34b000ulg7fkgithcb4",
        pay: 250,
        isMd: false,
        notes: "Please bring your own bongos",
        status: "accepted",
        createdAt: "2024-02-22T19:47:10.476Z",
        updatedAt: "2024-04-03T16:10:29.853Z",
        musicianId: "clsxmwzku000jlg7fcavb9lvd",
        eventId: "clsxmx0pl000nlg7fb28ak9cn",
        hotelNeeded: false,
        hotelBooked: false,
        hotelInfo: null,
        Instruments: {
          set: [
            {
              id: "clsxmwx3a0004lg7fh46pu2m8",
            },
            {
              id: "clsxmwxiq0007lg7fjo563bk4",
            },
          ],
        },
      },
      where: {
        id: "clsxmx34b000ulg7fkgithcb4",
      },
    });
  }),
});
