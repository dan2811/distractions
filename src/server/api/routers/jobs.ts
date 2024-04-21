import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { getInvoicePaidEmail } from "~/emails/musicians/musicians";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { sendEmail } from "~/utils/email";

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
          invoice: true,
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
  deleteInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ input: { invoiceId: id } }) => {
      const utApi = new UTApi();

      const { success } = await utApi.deleteFiles(id);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete invoice from UploadThing",
        });
      }

      console.log(`Deleted invoice from UploadThing, File ID: ${id}`);
      try {
        return prisma.invoice.delete({
          where: {
            id,
          },
        });
      } catch (e) {
        console.log(
          `Failed to delete invoice with id: ${id} from database: ${
            typeof e === "string" ? e : JSON.stringify(e)
          }`,
        );
      }
    }),
  markInvoicePaid: adminProcedure
    .input(z.object({ invoiceId: z.string(), musicianId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const res = await prisma.invoice.update({
          select: {
            Job: {
              include: {
                event: {
                  select: {
                    name: true,
                    date: true,
                  },
                },
              },
            },
          },
          where: {
            id: input.invoiceId,
          },
          data: {
            status: "paid",
          },
        });
        const musician = await prisma.user.findUnique({
          where: {
            id: input.musicianId,
          },
        });
        if (!musician) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Musician not found",
          });
        }

        if (!res.Job) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Job not found",
          });
        }
        const email = getInvoicePaidEmail(musician, res.Job);
        await sendEmail(email);
        return res;
      } catch (e) {
        console.error(
          `Failed to EITHER: mark invoice with id: ${
            input.invoiceId
          } as paid, OR send email to musician to notify of paid invoice: ${
            typeof e === "string" ? e : JSON.stringify(e)
          }`,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark invoice as paid or send email to musician",
        });
      }
    }),
});
