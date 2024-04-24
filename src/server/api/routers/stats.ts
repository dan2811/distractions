import { adminProcedure, createTRPCRouter } from "../trpc";
import { Client } from "@sendgrid/client";
import type { ClientResponse } from "@sendgrid/mail";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";

const sendGridMetricsSchema = z.object({
  blocks: z.number(),
  bounce_drops: z.number(),
  bounces: z.number(),
  clicks: z.number(),
  deferred: z.number(),
  delivered: z.number(),
  invalid_emails: z.number(),
  opens: z.number(),
  processed: z.number(),
  requests: z.number(),
  spam_report_drops: z.number(),
  spam_reports: z.number(),
  unique_clicks: z.number(),
  unique_opens: z.number(),
  unsubscribe_drops: z.number(),
  unsubscribes: z.number(),
});

const sendGridStatsSchema = z.object({
  date: z.string(),
  stats: z.array(
    z.object({
      metrics: sendGridMetricsSchema,
    }),
  ),
});

export const statsRouter = createTRPCRouter({
  getSendGridStats: adminProcedure
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      if (!input) {
        throw new TRPCError({
          message: 'Both a "from" and "to" date must be specified.',
          code: "BAD_REQUEST",
        });
      }
      if (!input.from || !input.to) {
        throw new TRPCError({
          message: 'Both a "from" and "to" date must be specified.',
          code: "BAD_REQUEST",
        });
      }
      try {
        const sgClient = new Client();
        sgClient.setApiKey(env.SENDGRID_API_KEY);
        const sgStats = (await sgClient.request({
          url: `/v3/stats`,
          method: "GET",
          qs: {
            start_date: input.from.toISOString().split("T")[0],
            end_date: input.to.toISOString().split("T")[0],
            aggregated_by: "day",
          },
        })) as [ClientResponse, z.infer<typeof sendGridStatsSchema>[]];

        if (sgStats[0].statusCode !== 200) {
          throw new TRPCError({
            message: "Error getting stats from SendGrid",
            code: "INTERNAL_SERVER_ERROR",
            cause: sgStats[0],
          });
        }

        const zodResult = sendGridStatsSchema.safeParse(sgStats[1][0]);

        if (!zodResult.success) {
          console.warn(
            "Send grid stats response is not valid. Check their docs to see what they have updated!!",
          );
        }

        // This sums up the metrics for all the days in the range
        const sum: Record<string, number> = {};

        for (const item of sgStats[1]) {
          const metricsObject = item.stats[0]?.metrics; // get the metrics object from the stats array
          if (metricsObject) {
            for (const key in metricsObject) {
              if (metricsObject.hasOwnProperty(key)) {
                if (!sum[key]) {
                  sum[key] = 0; // initialize the sum for this key if it doesn't exist yet
                }
                sum[key] += metricsObject[key as keyof typeof metricsObject]; // add the value to the sum
              }
            }
          }
        }

        return sum as z.infer<typeof sendGridMetricsSchema>;
      } catch (e) {
        console.error(
          `Error calling sendgrid API for stats ${
            typeof e === "string" ? e : JSON.stringify(e)
          }`,
        );
        throw new TRPCError({
          message: "Error getting stats from SendGrid",
          code: "INTERNAL_SERVER_ERROR",
          cause: e,
        });
      }
    }),
  getAppStats: adminProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.prisma.user.count();
    const totalEvents = await ctx.prisma.event.count();
    const totalSessions = await ctx.prisma.session.count();
    return {
      totalUsers,
      totalEvents,
      totalSessions,
    };
  }),
  getEventStats: adminProcedure
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (!input) {
        throw new TRPCError({
          message: 'Both a "from" and "to" date must be specified.',
          code: "BAD_REQUEST",
        });
      }
      if (!input.from || !input.to) {
        throw new TRPCError({
          message: 'Both a "from" and "to" date must be specified.',
          code: "BAD_REQUEST",
        });
      }
      const dateFilter = {
        gte: input.from,
        lte: input.to,
      };
      //This is a total of events that were added to the system within the specified date range
      const totalCreated = await ctx.prisma.event.count({
        where: {
          createdAt: dateFilter,
        },
      });

      //This is a total of events that take place within the specified date range
      const totalBooked = await ctx.prisma.event.count({
        where: {
          OR: [
            {
              status: "booked",
            },
            { status: "completed" },
          ],
          date: dateFilter,
        },
      });
      const totalCancelled = await ctx.prisma.event.count({
        where: {
          status: "cancelled",
          date: dateFilter,
        },
      });

      const eventTypes = await ctx.prisma.eventType.findMany({
        distinct: "id",
        select: {
          id: true,
          name: true,
          events: {
            select: {
              _count: true,
            },
            where: {
              date: dateFilter,
            },
          },
        },
      });
      const packages = await ctx.prisma.package.findMany({
        distinct: "id",
        select: {
          id: true,
          name: true,
          events: {
            select: {
              _count: true,
            },
            where: {
              date: dateFilter,
            },
          },
        },
      });

      return {
        totalCreated,
        totalBooked,
        totalCancelled,
        totalGroupedByEventType: eventTypes,
        totalGroupedByPackages: packages,
      };
    }),
  getFinanceStats: adminProcedure
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (!input) {
        throw new TRPCError({
          message: 'Both a "from" and "to" date must be specified.',
          code: "BAD_REQUEST",
        });
      }

      if (!input.from || !input.to) {
        throw new TRPCError({
          message: 'Both a "from" and "to" date must be specified.',
          code: "BAD_REQUEST",
        });
      }
      const aggregates = await ctx.prisma.event.aggregate({
        where: {
          date: {
            gte: input?.from,
            lte: input?.to,
          },
          status: {
            not: "cancelled",
          },
        },
        _avg: {
          price: true,
        },
        _sum: {
          price: true,
        },
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
      });

      const mostExpensiveEvent = await ctx.prisma.event.findFirst({
        select: {
          id: true,
        },
        where: {
          date: {
            gte: input?.from,
            lte: input?.to,
          },
          status: {
            not: "cancelled",
          },
        },
        orderBy: {
          price: "desc",
        },
      });

      const cheapestEvent = await ctx.prisma.event.findFirst({
        select: {
          id: true,
        },
        where: {
          date: {
            gte: input?.from,
            lte: input?.to,
          },
          status: {
            not: "cancelled",
          },
        },
        orderBy: {
          price: "asc",
        },
      });

      const wageStats = await ctx.prisma.job.aggregate({
        where: {
          event: {
            date: {
              gte: input?.from,
              lte: input?.to,
            },
          },
        },
        _avg: {
          pay: true,
        },
        _sum: {
          pay: true,
        },
        _min: {
          pay: true,
        },
        _max: {
          pay: true,
        },
      });
      return {
        averagePrice: aggregates._avg.price,
        totalRevenue: aggregates._sum.price,
        minPrice: aggregates._min.price,
        maxPrice: aggregates._max.price,
        mostExpensiveEvent,
        cheapestEvent,
        wageStats,
      };
    }),
});
