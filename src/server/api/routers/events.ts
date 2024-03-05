import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { cancelPaypalInvoices } from "./paypal/helper";
import { sendEmail } from "~/utils/email";
import { env } from "~/env.mjs";

export const eventRouter = createTRPCRouter({
  getMyBookings: protectedProcedure.query(({ ctx }) => {
    console.info("Getting bookings for user: ", ctx.session.user);
    return prisma.event.findMany({
      where: {
        ownerId: ctx.session.user.id,
      },
    });
  }),
  getMyGigs: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.role !== "musician")
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be a musician to access this resource",
      });
    console.info("Getting gigs for user: ", ctx.session.user);
    return prisma.event.findMany({
      select: {
        id: true,
        location: true,
        date: true,
      },
      where: {
        jobs: {
          every: {
            musicianId: ctx.session.user.id,
          },
        },
      },
    });
  }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ input }) => {
      return prisma.event.findUnique({
        include: {
          packages: true,
          contract: true,
        },
        where: {
          id: input.id,
        },
      });
    }),
  updateEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        name: z.string().optional(),
        date: z.string().optional(),
        location: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { eventId, ...data } = input;
      return prisma.event.update({
        where: {
          id: eventId,
        },
        data,
      });
    }),
  cancelEvent: adminProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const jobs = await prisma.job.findMany({
        where: {
          eventId: input.eventId,
        },
        select: {
          status: true,
          musician: {
            select: {
              email: true,
            },
          },
        },
      });

      await prisma.$transaction([
        prisma.event.update({
          where: {
            id: input.eventId,
          },
          data: {
            status: "cancelled",
            jobs: {
              updateMany: {
                where: {
                  eventId: input.eventId,
                },
                data: {
                  status: "cancelled",
                },
              },
            },
          },
        }),
        prisma.job.updateMany({
          where: {
            eventId: input.eventId,
          },
          data: {
            status: "cancelled",
          },
        }),
      ]);

      console.log("jobs: ", jobs);

      const event = await prisma.event.findFirst({
        where: {
          id: input.eventId,
        },
        select: {
          date: true,
        },
      });
      try {
        const emailPromises = jobs.map(({ musician, status }) => {
          if (status !== "accepted") {
            console.log(
              `not emailing ${musician.email} as their job status is ${status}`,
            );
            return;
          }
          if (musician?.email) {
            console.log(
              "Sending gig cancelled notification email to: ",
              musician.email,
            );
            return sendEmail({
              to: musician.email,
              subject: "Event Cancelled",
              text: `The event you were booked for ${
                event && `on ${event.date.toLocaleDateString("en-GB")} `
              }has been cancelled.`,
              from: env.EMAIL_FROM,
              html: `<p>The event you were booked for ${
                event && `on ${event.date.toLocaleDateString("en-GB")} `
              }has been cancelled</p>`,
            });
          }
        });
        // TODO: Not sure why this doesn't work? It's not sending emails.
        await Promise.allSettled(emailPromises);
      } catch (e) {
        console.error("Error sending gig cancelled emails: ", e);
      }
      try {
        return cancelPaypalInvoices(input.eventId);
      } catch (e) {
        console.error(
          `Error cancelling paypal invoices for event: ${input.eventId}: `,
          e,
        );
      }
    }),
});
